'use client';
import { useApiKey } from "@/components/providers/api-key-provider";
import { useAppContext, useMarketplaceClient } from "@/components/providers/marketplace";
import { usePagesContext } from "@/lib/hooks/useQuery";
import { useChat } from "@ai-sdk/react";
import { type UIMessage, parsePartialJson } from "ai";
import { ClientSDK, PagesContext } from "@sitecore-marketplace-sdk/client";
import { DefaultChatTransport } from "ai";
import { useEffect, useState, useRef, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CodeBlock } from "@/components/ai-elements/code-block";
import { cn } from "@/lib/utils";
import { CheckIcon, XIcon, Sparkles } from "lucide-react";
import {
    Reasoning,
    ReasoningContent,
    ReasoningTrigger,
} from '@/components/ai-elements/reasoning';
import { diffLines } from 'diff';
import { sanitizeLayout } from "@/lib/sitecore";

/**
 * Extracts the first JSON code block or raw JSON string from an AI message.
 */
async function extractJsonFromMessage(message: UIMessage) {
    const text = message.parts.filter(part => part.type === 'text')[0]?.text;
    const val = await parsePartialJson(text);
    return JSON.stringify((val.value as { items: unknown[] })?.items, null, 2);
}

/**
 * A JSON editor with syntax highlighting using a layered approach.
 */
const JsonEditor = ({ value, onChange, className }: { value: string; onChange: (val: string) => void; className?: string }) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const preRef = useRef<HTMLDivElement>(null);

    const handleScroll = () => {
        if (textareaRef.current && preRef.current) {
            preRef.current.scrollTop = textareaRef.current.scrollTop;
            preRef.current.scrollLeft = textareaRef.current.scrollLeft;
        }
    };

    const calculatedWidth = useMemo(() => {
        const lines = value.split('\n');
        const longestLine = lines.reduce((max, line) => Math.max(max, line.length), 0);
        return Math.max(800, (longestLine * 8.4) + 64); // Minimum 800px, 8.4px per char
    }, [value]);

    return (
        <div className={cn("relative font-mono text-sm border rounded-md overflow-hidden bg-background", className)} style={{ width: `${calculatedWidth}px` }}>
            <div className="absolute inset-0 pointer-events-none overflow-x-auto overflow-y-hidden" ref={preRef}>
                <CodeBlock
                    code={value}
                    language="json"
                    className="border-none bg-transparent! p-0! m-0! [&>pre]:p-4! [&>pre]:bg-transparent!"
                />
            </div>
            <textarea
                ref={textareaRef}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onScroll={handleScroll}
                spellCheck={false}
                className="relative z-10 w-full h-full p-4 bg-transparent text-transparent caret-foreground resize-none focus:outline-none whitespace-pre overflow-auto block"
                style={{
                    fontFamily: 'inherit',
                    fontSize: 'inherit',
                    lineHeight: 'inherit',
                }}
            />
        </div>
    );
};

/**
 * A specialized Diff view with synced scrolling and aligned git-style highlighting.
 */
const DiffView = ({ oldCode, newCode, className }: { oldCode: string; newCode: string; className?: string }) => {
    const leftRef = useRef<HTMLDivElement>(null);
    const rightRef = useRef<HTMLDivElement>(null);

    const syncScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const source = e.currentTarget;
        const target = source === leftRef.current ? rightRef.current : leftRef.current;
        if (target) {
            target.scrollTop = source.scrollTop;
            target.scrollLeft = source.scrollLeft;
        }
    };

    // Calculate robust aligned diff
    const { alignedOld, alignedNew, oldHighlights, newHighlights } = useMemo(() => {
        const diff = diffLines(oldCode, newCode);

        const oldLines: string[] = [];
        const newLines: string[] = [];
        const oldH: { line: number; color: string }[] = [];
        const newH: { line: number; color: string }[] = [];

        let oldLineIdx = 1;
        let newLineIdx = 1;

        diff.forEach(part => {
            const lines = part.value.split('\n');
            // Remove trailing empty string from split if it exists
            if (lines[lines.length - 1] === '') lines.pop();

            if (part.added) {
                lines.forEach(line => {
                    newLines.push(line);
                    newH.push({ line: newLineIdx, color: 'rgba(34, 197, 94, 0.15)' });
                    newLineIdx++;
                });
            } else if (part.removed) {
                lines.forEach(line => {
                    oldLines.push(line);
                    oldH.push({ line: oldLineIdx, color: 'rgba(239, 68, 68, 0.15)' });
                    oldLineIdx++;
                });
            } else {
                lines.forEach(line => {
                    oldLines.push(line);
                    newLines.push(line);
                    oldLineIdx++;
                    newLineIdx++;
                });
            }
        });

        return {
            alignedOld: oldLines.join('\n'),
            alignedNew: newLines.join('\n'),
            oldHighlights: oldH,
            newHighlights: newH
        };
    }, [oldCode, newCode]);

    return (
        <div className={cn("grid grid-cols-2 gap-4", className)}>
            <div
                ref={leftRef}
                onScroll={syncScroll}
                className="h-full border rounded-md overflow-scroll relative bg-background"
            >
                <div className="min-w-max">
                    <CodeBlock
                        code={alignedOld}
                        language="json"
                        highlightLines={oldHighlights}
                        className="border-none bg-transparent! p-0! m-0! [&>pre]:p-4! [&>pre]:bg-transparent!"
                    />
                </div>
            </div>
            <div
                ref={rightRef}
                onScroll={syncScroll}
                className="h-full border border-primary/30 rounded-md overflow-scroll relative bg-background shadow-sm"
            >
                <div className="min-w-max">
                    <CodeBlock
                        code={alignedNew}
                        language="json"
                        highlightLines={newHighlights}
                        className="border-none bg-transparent! p-0! m-0! [&>pre]:p-4! [&>pre]:bg-transparent!"
                    />
                </div>
            </div>
        </div>
    );
};

export const CustomFieldPage = () => {
    const client = useMarketplaceClient();
    const appContext = useAppContext();
    const pageContext = usePagesContext();
    const apiKey = useApiKey('vercel');

    const sitecoreContextId = appContext?.resourceAccess?.[0]?.context?.preview;
    const currentFieldValue = useRef<string>("");
    const pageInfoRef = useRef({});
    const pageLayoutRef = useRef({});
    const siteRef = useRef({});
    const pageRef = useRef({});

    const { messages, status, sendMessage, setMessages } = useChat({
        transport: new DefaultChatTransport({
            api: '/api/schema-org',
            headers: {
                'x-vercel-api-key': apiKey!,
            },
            body: () => ({
                currentFieldValue: currentFieldValue.current,
                layout: pageLayoutRef.current,
                site: siteRef.current,
                currentPage: pageRef.current,
            })
        })
    });

    const [existingValue, setExistingValue] = useState<string>("");
    const [newValue, setNewValue] = useState<string | undefined>(undefined);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchValue() {
            try {
                const res = await client.getValue();
                setExistingValue(res || "");
            } catch (error) {
                console.error("Failed to fetch existing value", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchValue();
    }, [client]);

    // Update newValue when a new assistant message arrives
    useEffect(() => {
        const lastMessage = messages[messages.length - 1];
        if (lastMessage?.role === 'assistant') {
            const updateValue = async () => {
                const extracted = await extractJsonFromMessage(lastMessage);
                const length = newValue?.length || 0;
                if (extracted && length < extracted.length) {
                    setNewValue(extracted);
                }
            };
            updateValue();
        }
    }, [messages]);

    useEffect(() => {
        currentFieldValue.current = existingValue;
    }, [existingValue]);

    const handleGenerate = async () => {
        setIsLoading(true);
        // Reset chat and new value
        setMessages([]);
        setNewValue(undefined);

        const information = await getRenderPageResult(client, pageContext, sitecoreContextId!);
        if (!information) {
            console.error("Failed to get render page result");
            setIsLoading(false);
            return;
        }
        pageInfoRef.current = pageContext ? {
            url: pageContext.pageInfo?.url,
            title: pageContext.pageInfo?.title,
            language: pageContext.pageInfo?.language,
            route: pageContext.pageInfo?.route,
            site: pageContext.pageInfo?.site,
        } : {};
        pageLayoutRef.current = information.placeholders;
        siteRef.current = information.site;
        pageRef.current = information.page;
        // return;
        await sendMessage({
            role: 'user',
            parts: [{ type: 'text', text: 'Generate' }],
        });
        setIsLoading(false);
    };

    const handleAccept = async () => {
        if (newValue && newValue != existingValue) {
            await client.setValue(newValue);
            setExistingValue(newValue);
            setNewValue(undefined);
            setMessages([]);
        }
    };

    const handleReject = () => {
        setNewValue(undefined);
        setMessages([]);
    };

    if (isLoading && !existingValue && (status === 'streaming' || status === 'submitted')) {
        // Continue showing loading if streaming just started
    } else if (isLoading && !existingValue) {
        return <div className="p-8 flex items-center justify-center">Loading...</div>;
    }

    return (
        <div className="container mx-auto">
            <Card className="px-4 py-0">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Sparkles className="size-5 text-primary" />
                        Schema.org Generator
                    </CardTitle>
                    <CardDescription>
                        Generate and manage JSON-LD structured data for this page to improve SEO.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {newValue ? (
                        <div className="space-y-2">
                            <div className="flex justify-between items-center text-sm font-medium text-muted-foreground px-1">
                                <span>Existing Value</span>
                                <span>Generated Value (Preview)</span>
                            </div>
                            <DiffView
                                oldCode={existingValue || "// No existing value"}
                                newCode={newValue}
                                className="h-[400px]"
                            />
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground px-1">Existing Field Value</label>
                            <div className="w-full overflow-auto">
                                <JsonEditor
                                    value={existingValue}
                                    onChange={setExistingValue}
                                    className="h-[400px]"
                                />
                            </div>
                        </div>
                    )}
                    {(
                        <div className="space-y-4">
                            {(messages[messages.length - 1]?.parts ?? []).map((part, i) => {
                                if (part.type === 'reasoning') {
                                    return (
                                        <Reasoning
                                            key={`reasoning-${i}`}
                                            className="w-full"
                                            isStreaming={status === 'streaming' && i === messages[messages.length - 1].parts.length - 1}
                                        >
                                            <ReasoningTrigger />
                                            <ReasoningContent>{part.text}</ReasoningContent>
                                        </Reasoning>
                                    );
                                }
                                return null;
                            })}
                            {status === 'streaming' && !newValue && <Card className="border-primary/20 bg-primary/5">
                                <CardContent className="p-4 text-sm text-center animate-pulse">
                                    Analyzing page structure and generating JSON-LD...
                                </CardContent>
                            </Card>}
                        </div>
                    )}
                </CardContent>
                <CardFooter className="flex justify-between border-t p-6">
                    <div className="flex gap-2">
                        {newValue ? (
                            <>
                                <Button variant="outline" onClick={handleReject} className="gap-2">
                                    <XIcon className="size-4" />
                                    Reject
                                </Button>
                                <Button onClick={handleAccept} className="gap-2" disabled={newValue === existingValue}>
                                    <CheckIcon className="size-4" />
                                    Accept & Save
                                </Button>
                            </>
                        ) : (
                            <Button variant="outline" onClick={() => client.setValue(existingValue)}>
                                Save Manual Changes
                            </Button>
                        )}
                    </div>
                    <Button
                        onClick={handleGenerate}
                        disabled={status === 'streaming' || status === 'submitted'}
                        className="gap-2"
                    >
                        {(status === 'streaming' || status === 'submitted') ? "Generating..." : (
                            <>
                                <Sparkles className="size-4" />
                                Generate Schema
                            </>
                        )}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
};

const getRenderPageResult = async (client: ClientSDK, pageContext: PagesContext | undefined, sitecoreContextId: string) => {
    if (!pageContext) return;
    const { pageInfo, siteInfo } = pageContext;
    if (!pageInfo || !siteInfo) {
        return;
    }
    try {
        const renderedResult = await client.mutate("xmc.live.graphql", {
            params: {
                body: {
                    query: `query {
      layout(site: "${siteInfo.name}", routePath: "${pageInfo.route}", language: "${pageInfo.language}") {
        item {
          rendered
        }
      }
    }`
                },
                query: {
                    sitecoreContextId,
                }
            }
        });

        const route = (renderedResult?.data?.data?.layout as any)?.item?.rendered?.sitecore?.route;

        const site = await client.query('xmc.xmapp.retrieveSite', {
            params: {
                path: {
                    siteId: siteInfo.id!,
                },
                query: {
                    sitecoreContextId,
                }
            }
        });
        console.log('pageInfo', pageInfo);
        console.log('siteInfo', siteInfo);

        return {
            placeholders: sanitizeLayout(route?.placeholders),
            page: {
                fields: route?.fields,
                isHome: pageInfo.id === siteInfo.startItemId,
            },
            site: {
                host: 'https://' + site?.data?.data?.hosts?.[0]?.targetHostname,
                // TODO: add item path info
            }
        }
    } catch (e) {
        console.error("Error fetching rendered result", e);
        return null;
    }
};

export default CustomFieldPage;
