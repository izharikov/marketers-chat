'use client';
import { useApiKey } from "@/components/providers/api-key-provider";
import { useAppContext, useMarketplaceClient } from "@/components/providers/marketplace";
import { usePagesContext } from "@/lib/hooks/useQuery";
import { useChat } from "@ai-sdk/react";
import { type UIMessage, parsePartialJson } from "ai";
import { ClientSDK, PagesContext } from "@sitecore-marketplace-sdk/client";
import { DefaultChatTransport } from "ai";
import { useEffect, useState, useRef } from "react";
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

/**
 * Extracts the first JSON code block or raw JSON string from an AI message.
 */
async function extractJsonFromMessage(message: UIMessage) {
    const text = message.parts.filter(part => part.type === 'text')[0]?.text;
    return JSON.stringify(await parsePartialJson(text), null, 2);
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

    return (
        <div className={cn("relative font-mono text-sm border rounded-md overflow-hidden bg-background", className)}>
            <div className="absolute inset-0 pointer-events-none overflow-hidden" ref={preRef}>
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

export const CustomFieldPage = () => {
    const client = useMarketplaceClient();
    const appContext = useAppContext();
    const pageContext = usePagesContext();
    const apiKey = useApiKey('vercel');

    const sitecoreContextId = appContext?.resourceAccess?.[0]?.context?.preview;

    const { messages, status, sendMessage, setMessages } = useChat({
        transport: new DefaultChatTransport({
            api: '/api/schema-org',
            headers: {
                'x-vercel-api-key': apiKey!,
            },
            body: {}
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

    const handleGenerate = async () => {
        setIsLoading(true);
        // Reset chat and new value
        setMessages([]);
        setNewValue(undefined);

        const placeholders = await getRenderPageResult(client, pageContext, sitecoreContextId!);
        if (!placeholders) {
            console.error("Failed to get render page result");
            setIsLoading(false);
            return;
        }

        await sendMessage({
            role: 'user',
            parts: [
                {
                    type: 'text',
                    text: JSON.stringify(placeholders),
                }
            ]
        });
        setIsLoading(false);
    };

    const handleAccept = async () => {
        if (newValue) {
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

    if (isLoading && !existingValue && status !== 'streaming') {
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
                            <div className="grid grid-cols-2 gap-4 h-[400px]">
                                <CodeBlock
                                    code={existingValue || "// No existing value"}
                                    language="json"
                                    className="h-full border rounded-md"
                                />
                                <CodeBlock
                                    code={newValue}
                                    language="json"
                                    className="h-full border border-primary/50 shadow-sm rounded-md"
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground px-1">Existing Field Value</label>
                            <JsonEditor
                                value={existingValue}
                                onChange={setExistingValue}
                                className="h-[500px]"
                            />
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
                                <Button onClick={handleAccept} className="gap-2">
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
                        disabled={status === 'streaming'}
                        className="gap-2"
                    >
                        {status === 'streaming' ? "Generating..." : (
                            <>
                                <Sparkles className="size-4" />
                                Generate Schema
                            </>
                        )}
                    </Button>
                </CardFooter>
            </Card>

            {(
                <div className="space-y-4">
                    {messages[messages.length - 1]?.parts.map((part, i) => {
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

        return (renderedResult?.data?.data?.layout as any)?.item?.rendered?.sitecore?.route?.placeholders;
    } catch (e) {
        console.error("Error fetching rendered result", e);
        return null;
    }
};

export default CustomFieldPage;
