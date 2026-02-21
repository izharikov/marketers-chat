'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { ClientSDK, PagesContext } from '@sitecore-marketplace-sdk/client';
import { DefaultChatTransport } from 'ai';
import { DeepPartial, type UIMessage, parsePartialJson } from 'ai';
import { diffLines } from 'diff';
import { CheckIcon, Ellipsis, Settings, Sparkles, XIcon } from 'lucide-react';
import { CodeBlock } from '@/components/ai-elements/code-block';
import { Loader } from '@/components/ai-elements/loader';
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from '@/components/ai-elements/reasoning';
import {
  useApiKey,
  useAppSettings,
} from '@/components/providers/app-settings-provider';
import {
  useAppContext,
  useMarketplaceClient,
} from '@/components/providers/marketplace';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { PageStructuredData } from '@/lib/api/schema-org';
import { useFieldValue } from '@/lib/hooks/useFieldValue';
import { usePagesContext } from '@/lib/hooks/useQuery';
import { Component, sanitizeLayout } from '@/lib/sitecore';
import { cn } from '@/lib/utils';

/**
 * Extracts the first JSON code block or raw JSON string from an AI message.
 */
async function extractResultFromMessage(
  message: UIMessage
): Promise<DeepPartial<PageStructuredData>> {
  const text = message.parts.filter((part) => part.type === 'text')[0]?.text;
  const val = await parsePartialJson(text);
  const aiResult = (val.value as DeepPartial<PageStructuredData>) ?? {};
  return aiResult;
}

function formatValue(
  obj: DeepPartial<PageStructuredData> | undefined
): string | undefined {
  if (!obj) {
    return undefined;
  }
  const result = Object.values(obj)
    .filter((v) => (v?.probability ?? 0) > 50 && typeof v?.item === 'object')
    .map((v) => v?.item);
  return JSON.stringify(result, null, 2);
}

/**
 * A JSON editor with syntax highlighting using a layered approach.
 */
const JsonEditor = ({
  value,
  onChange,
  className,
}: {
  value: string;
  onChange: (val: string) => void;
  className?: string;
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const preRef = useRef<HTMLDivElement>(null);

  const calculatedWidth = useMemo(() => {
    const lines = value.split('\n');
    const longestLine = lines.reduce(
      (max, line) => Math.max(max, line.length),
      0
    );
    return Math.max(800, longestLine * 8.4 + 64); // Minimum 800px, 8.4px per char
  }, [value]);

  return (
    <div
      className={cn(
        'relative font-mono text-sm bg-background h-full',
        className
      )}
    >
      <div
        className='inset-0 overflow-hidden relative min-w-full min-h-full'
        style={{ width: calculatedWidth }}
        ref={preRef}
      >
        <CodeBlock
          code={value}
          language='json'
          className='border-none pointer-events-none bg-transparent! p-0! m-0! [&>pre]:p-4! [&>pre]:bg-transparent!'
        />
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          spellCheck={false}
          className='absolute top-0 left-0 z-10 w-full h-full p-4 bg-transparent text-transparent caret-foreground resize-none focus:outline-none whitespace-pre overflow-auto block'
          style={{
            fontFamily: 'inherit',
            fontSize: 'inherit',
            lineHeight: 'inherit',
          }}
        />
      </div>
    </div>
  );
};

/**
 * A specialized Diff view with synced scrolling and aligned git-style highlighting.
 */
const DiffView = ({
  oldCode,
  newCode,
  className,
}: {
  oldCode: string;
  newCode: string;
  className?: string;
}) => {
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);

  const syncScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const source = e.currentTarget;
    const target =
      source === leftRef.current ? rightRef.current : leftRef.current;
    if (target) {
      target.scrollTop = source.scrollTop;
      target.scrollLeft = source.scrollLeft;
    }
  };

  // Calculate robust aligned diff
  const { alignedOld, alignedNew, oldHighlights, newHighlights } =
    useMemo(() => {
      const diff = diffLines(oldCode, newCode);

      const oldLines: string[] = [];
      const newLines: string[] = [];
      const oldH: { line: number; color: string }[] = [];
      const newH: { line: number; color: string }[] = [];

      let oldLineIdx = 1;
      let newLineIdx = 1;

      diff.forEach((part) => {
        const lines = part.value.split('\n');
        // Remove trailing empty string from split if it exists
        if (lines[lines.length - 1] === '') lines.pop();

        if (part.added) {
          lines.forEach((line) => {
            newLines.push(line);
            newH.push({ line: newLineIdx, color: 'rgba(34, 197, 94, 0.15)' });
            newLineIdx++;
          });
        } else if (part.removed) {
          lines.forEach((line) => {
            oldLines.push(line);
            oldH.push({ line: oldLineIdx, color: 'rgba(239, 68, 68, 0.15)' });
            oldLineIdx++;
          });
        } else {
          lines.forEach((line) => {
            oldLines.push(line);
            newLines.push(line);
            oldLineIdx++;
            newLineIdx++;
          });
        }
      });
      const maxLength = Math.max(oldLines.length, newLines.length);
      while (oldLines.length < maxLength) oldLines.push('');
      while (newLines.length < maxLength) newLines.push('');

      return {
        alignedOld: oldLines.join('\n'),
        alignedNew: newLines.join('\n'),
        oldHighlights: oldH,
        newHighlights: newH,
      };
    }, [oldCode, newCode]);

  return (
    <div className={cn('grid grid-cols-2 gap-4', className)}>
      <div
        ref={leftRef}
        onScroll={syncScroll}
        className='h-full border rounded-md overflow-scroll relative bg-background'
      >
        <div className='min-w-max'>
          <CodeBlock
            code={alignedOld}
            language='json'
            highlightLines={oldHighlights}
            className='border-none bg-transparent! p-0! m-0! [&>pre]:p-4! [&>pre]:bg-transparent!'
          />
        </div>
      </div>
      <div
        ref={rightRef}
        onScroll={syncScroll}
        className='h-full border border-primary/30 rounded-md overflow-scroll relative bg-background shadow-sm'
      >
        <div className='min-w-max'>
          <CodeBlock
            code={alignedNew}
            language='json'
            highlightLines={newHighlights}
            className='border-none bg-transparent! p-0! m-0! [&>pre]:p-4! [&>pre]:bg-transparent!'
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
  const { setModalOpen } = useAppSettings();
  const [generatedSchema, setGeneratedSchema] =
    useState<DeepPartial<PageStructuredData>>();

  const sitecoreContextId = appContext?.resourceAccess?.[0]?.context?.preview;

  const { messages, status, sendMessage, setMessages } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/schema-org',
      headers: () => ({
        'x-vercel-api-key': apiKey!,
      }),
    }),
  });

  const newValue =
    messages.length > 0 ? formatValue(generatedSchema) : undefined;
  const { existingValue, setExistingValue } = useFieldValue();
  const [isLoading, setIsLoading] = useState(true);

  // Update newValue when a new assistant message arrives
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.role === 'assistant') {
      let isActive = true;
      (async () => {
        const val = await extractResultFromMessage(lastMessage);
        if (!isActive) {
          return;
        }
        setGeneratedSchema(val);
      })();
      return () => {
        isActive = false;
      };
    }
  }, [messages]);

  const handleGenerate = async () => {
    setIsLoading(true);
    setGeneratedSchema(undefined);
    // Reset chat and new value
    setMessages([]);

    const information = await getPageInformation(
      client,
      pageContext,
      sitecoreContextId!
    );
    if (!information) {
      console.error('Failed to get render page result');
      setIsLoading(false);
      return;
    }
    // pageInfoRef.current = pageContext ? {
    //     url: pageContext.pageInfo?.url,
    //     title: pageContext.pageInfo?.title,
    //     language: pageContext.pageInfo?.language,
    //     route: pageContext.pageInfo?.route,
    //     site: pageContext.pageInfo?.site,
    // } : {};
    // pageLayoutRef.current = information.placeholders;
    // siteRef.current = information.site;
    // currentPageRef.current = information.page;
    // languageRef.current = pageContext?.pageInfo?.language ?? 'en';
    // return;
    await sendMessage(undefined, {
      body: {
        layout: information.placeholders,
        site: information.site,
        currentPage: information.page,
        language: pageContext?.pageInfo?.language ?? 'en',
      },
    });
    setIsLoading(false);
  };

  const handleAccept = async () => {
    if (newValue && newValue != existingValue) {
      await client.setValue(newValue);
      setExistingValue(newValue);
      setMessages([]);
    }
  };

  const handleReject = () => {
    setMessages([]);
  };

  if (
    isLoading &&
    !existingValue &&
    (status === 'streaming' || status === 'submitted')
  ) {
    // Continue showing loading if streaming just started
  } else if (isLoading && typeof existingValue === undefined) {
    return (
      <div className='flex'>
        <div className='relative mx-auto h-[100px]'>
          <Loader className='absolute bottom-0 left-0' />
        </div>
      </div>
    );
  }

  return (
    <div className='container mx-auto'>
      <Card className='px-4 py-0'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Sparkles className='size-5 text-primary' />
            Schema.org Generator
            <div className='flex flex-1 justify-end'>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant='ghost' size='icon-sm'>
                    <Ellipsis />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end'>
                  <DropdownMenuGroup>
                    <DropdownMenuItem onClick={() => setModalOpen?.(true)}>
                      <Settings />
                      Settings
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardTitle>
          <CardDescription>
            Generate and manage JSON-LD structured data for this page to improve
            SEO.
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          {newValue ? (
            <div className='space-y-2'>
              <div className='flex justify-between items-center text-sm font-medium text-muted-foreground px-1'>
                <span>Existing Value</span>
                <span>Generated Value (Preview)</span>
              </div>
              <DiffView
                oldCode={existingValue || '// No existing value'}
                newCode={newValue}
                className='h-[400px]'
              />
            </div>
          ) : (
            <div className='space-y-2'>
              <label className='text-sm font-medium text-muted-foreground px-1'>
                Existing Field Value
              </label>
              <div className='border h-[400px] overflow-auto rounded-md w-full'>
                <JsonEditor
                  value={existingValue ?? ''}
                  onChange={setExistingValue}
                />
              </div>
            </div>
          )}
          {
            <div className='space-y-4'>
              {(messages[messages.length - 1]?.parts ?? []).map((part, i) => {
                if (part.type === 'reasoning') {
                  return (
                    <Reasoning
                      key={`reasoning-${i}`}
                      className='w-full'
                      isStreaming={
                        status === 'streaming' &&
                        i === messages[messages.length - 1].parts.length - 1
                      }
                    >
                      <ReasoningTrigger />
                      <ReasoningContent>{part.text}</ReasoningContent>
                    </Reasoning>
                  );
                }
                return null;
              })}
              {generatedSchema && Object.keys(generatedSchema).length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className='text-base'>
                      Schema Types Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent className='p-0'>
                    <div className='overflow-x-auto'>
                      <table className='w-full'>
                        <thead className='border-b bg-muted/50'>
                          <tr>
                            <th className='text-left p-3 font-medium text-sm'>
                              Type
                            </th>
                            <th className='text-center p-3 font-medium text-sm w-24'>
                              Included
                            </th>
                            <th className='text-left p-3 font-medium text-sm'>
                              Explanation
                            </th>
                          </tr>
                        </thead>
                        <tbody className='divide-y'>
                          {Object.entries(generatedSchema).map(
                            ([key, value]) => {
                              const probability = value?.probability ?? 0;
                              const isIncluded =
                                probability > 0 &&
                                value?.item !== null &&
                                value?.item !== undefined;

                              return (
                                <tr key={key} className='hover:bg-muted/30'>
                                  <td className='p-3'>
                                    <code className='text-sm bg-muted px-2 py-1 rounded'>
                                      {value?.type || key}
                                    </code>
                                  </td>
                                  <td className='p-3 text-center'>
                                    <div className='flex items-center justify-center gap-2'>
                                      {isIncluded ? (
                                        <CheckIcon className='size-5 text-green-600' />
                                      ) : (
                                        <XIcon className='size-5 text-red-600' />
                                      )}
                                      <span className='text-xs text-muted-foreground'>
                                        {probability}%
                                      </span>
                                    </div>
                                  </td>
                                  <td className='p-3 text-sm text-muted-foreground'>
                                    {value?.probabilityExplanation ||
                                      'No explanation available'}
                                  </td>
                                </tr>
                              );
                            }
                          )}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )}
              {status === 'streaming' && !newValue && (
                <Card className='border-primary/20 bg-primary/5'>
                  <CardContent className='p-4 text-sm text-center animate-pulse'>
                    Analyzing page structure and generating JSON-LD...
                  </CardContent>
                </Card>
              )}
            </div>
          }
        </CardContent>
        <CardFooter className='flex justify-between border-t p-6'>
          <div className='flex gap-2'>
            {newValue ? (
              <>
                <Button
                  variant='outline'
                  onClick={handleReject}
                  className='gap-2'
                >
                  <XIcon className='size-4' />
                  Reject
                </Button>
                <Button
                  onClick={handleAccept}
                  className='gap-2'
                  disabled={newValue === existingValue}
                >
                  <CheckIcon className='size-4' />
                  Accept & Save
                </Button>
              </>
            ) : (
              <Button
                variant='outline'
                onClick={() => client.setValue(existingValue ?? '')}
              >
                Save Manual Changes
              </Button>
            )}
          </div>
          <Button
            onClick={handleGenerate}
            disabled={status === 'streaming' || status === 'submitted'}
            className='gap-2'
          >
            {status === 'streaming' || status === 'submitted' ? (
              'Generating...'
            ) : (
              <>
                <Sparkles className='size-4' />
                Generate Schema
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

const getPageInformation = async (
  client: ClientSDK,
  pageContext: PagesContext | undefined,
  sitecoreContextId: string
) => {
  if (!pageContext) return;
  const { pageInfo, siteInfo } = pageContext;
  if (!pageInfo || !siteInfo) {
    return;
  }
  try {
    const renderedResult = await client.mutate('xmc.live.graphql', {
      params: {
        body: {
          query: `query {
      layout(site: "${siteInfo.name}", routePath: "${pageInfo.route}", language: "${pageInfo.language}") {
        item {
          rendered
          fields {
            name
            value
          }
        }
      }
    }`,
        },
        query: {
          sitecoreContextId,
        },
      },
    });

    const item = (
      renderedResult?.data?.data?.layout as {
        item: {
          rendered: {
            sitecore: {
              route: {
                placeholders: Record<string, Component[]>;
                fields: unknown;
              };
            };
          };
          fields: { name: string; value: string }[];
        };
      }
    )?.item;
    const route = item?.rendered?.sitecore?.route;

    const site = await client.query('xmc.xmapp.retrieveSite', {
      params: {
        path: {
          siteId: siteInfo.id!,
        },
        query: {
          sitecoreContextId,
        },
      },
    });

    return {
      placeholders: sanitizeLayout(route?.placeholders),
      page: {
        fields: route?.fields,
        isHome: pageInfo.id === siteInfo.startItemId,
        route: pageInfo.route,
        templateName: pageInfo.template?.name,
        created: item?.fields?.find((x) => x.name === '__Created')?.value,
        updated: item?.fields?.find((x) => x.name === '__Updated')?.value,
      },
      site: {
        name: siteInfo.name,
        host: 'https://' + site?.data?.data?.hosts?.[0]?.targetHostname,
      },
    };
  } catch (e) {
    console.error('Error fetching rendered result', e);
    return null;
  }
};

export default CustomFieldPage;
