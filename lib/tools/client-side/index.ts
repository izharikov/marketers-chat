import { ClientSDK } from "@sitecore-marketplace-sdk/client";
import { tool } from "ai";
import { z } from "zod";

export type ToolConfig<TInput> = {
    description: string;
    inputSchema: z.ZodType<TInput>;
    execute: (opts: { client: ClientSDK, sitecoreContextId: string }, input: TInput) => Promise<any>;
}

function define<TInput>(config: ToolConfig<TInput>) {
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

export const clientSideTools = {
    get_current_page_context: tool({ ...tools.get_current_page_context, execute: undefined }),
    reload_current_page: tool({ ...tools.reload_current_page, execute: undefined }),
    navigate_to_another_page: tool({ ...tools.navigate_to_another_page, execute: undefined }),
};

export async function executeClientSideTool({ client, sitecoreContextId }: { client: ClientSDK, sitecoreContextId: string }, tool: string, input: any, ignoreNotFound: boolean = false) {
    const toolFunction = tools[tool as keyof typeof tools] as ToolConfig<any>;
    if (!toolFunction) {
        if (ignoreNotFound) {
            return;
        }
        throw new Error('Tool not found');
    }
    return toolFunction.execute({ client, sitecoreContextId }, toolFunction.inputSchema.parse(input));
}
