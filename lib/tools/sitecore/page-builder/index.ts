import { tool } from 'ai';
import { z } from 'zod';import { ClientSideContext, ClientSideTool } from '../types';

export type ToolConfig<TInput, TOutput> = {
    description: string;
    inputSchema: z.ZodType<TInput>;
    execute: (opts: ClientSideContext, input: TInput) => Promise<TOutput>;
}

function define<TInput, TOutput>(config: ToolConfig<TInput, TOutput>) {
    return config;
}

const tools = {
    get_current_page_context: define({
        description: 'Get current page context',
        inputSchema: z.object({}),
        execute: async ({ client }) => {
            const response = await client.query('pages.context');
            if (response.isError || !response.data) {
                throw response.error;
            }

            return response.data.pageInfo;
        },
    }),
    get_current_site_context: define({
        description: 'Get current site context',
        inputSchema: z.object({}),
        execute: async ({ client }) => {
            const response = await client.query('site.context');
            if (response.isError || !response.data) {
                throw response.error;
            }
            return response.data.siteInfo;
        },
    }),
    reload_current_page: define({
        description: 'Reload current page',
        inputSchema: z.object({}),
        execute: async ({ client }) => {
            const currentPage = await client.query('pages.context');
            if (currentPage.isError || !currentPage.data || !currentPage.data.pageInfo) {
                throw currentPage.error;
            }
            await client.mutate('pages.context', {
                params: {
                    itemId: currentPage.data.pageInfo.id,
                }
            });
            return 'Reloaded current page';
        },
    }),
    navigate_to_another_page: define({
        description: 'Navigate to another page',
        inputSchema: z.object({ itemId: z.string() }),
        execute: async ({ client }, { itemId }) => {
            await client.mutate('pages.context', {
                params: {
                    itemId,
                }
            });
            return 'Navigated to item: ' + itemId;
        },
    }),
    revert_operation: define({
        description: 'Revert operation',
        inputSchema: z.object({ jobId: z.string() }),
        execute: async ({ client, sitecoreContextId }, { jobId }) => {
            const response = await client.mutate('xmc.agent.jobsRevertJob', {
                params: {
                    query: {
                        sitecoreContextId,
                    },
                    path: {
                        jobId,
                    },
                }
            });
            if ('error' in response) {
                throw JSON.stringify(response.error);
            }
            try {
                await client.mutate('pages.reloadCanvas');
            } catch (error) {
                console.error('Error reloading canvas', error);
            }
            return JSON.stringify(response.data);
        },
    }),
}

export const pageBuilderTools = {
    get_current_page_context: tool({ ...tools.get_current_page_context, execute: undefined }),
    reload_current_page: tool({ ...tools.reload_current_page, execute: undefined }),
    navigate_to_another_page: tool({ ...tools.navigate_to_another_page, execute: undefined }),
};

export type PageBuilderToolName = keyof typeof pageBuilderTools;

export async function executePageBuilderTool(context: ClientSideContext, tool: ClientSideTool) {
    const toolFunction = tools[tool.toolName as keyof typeof pageBuilderTools] as ToolConfig<unknown, unknown>;
    if (!toolFunction) {
        return {
            success: false,
            error: 'Tool not found',
        };
    }
    return {
        success: true,
        result: await toolFunction.execute(context, toolFunction.inputSchema.parse(tool.input)),
    };
}
