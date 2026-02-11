import { ClientSDK } from "@sitecore-marketplace-sdk/client";
import { tool } from "ai";
import { z } from "zod";

export type ToolConfig<TInput> = {
    description: string;
    inputSchema: z.ZodType<TInput>;
    execute: (client: ClientSDK, input: TInput) => Promise<any>;
}

function define<TInput>(config: ToolConfig<TInput>) {
    return config;
}

const tools = {
    get_current_page_context: define({
        description: 'Get current page context',
        inputSchema: z.object({}),
        execute: async (client: ClientSDK) => {
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
        execute: async (client: ClientSDK) => {
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
        execute: async (client: ClientSDK) => {
            await client.mutate('pages.reloadCanvas');
            return 'Reloaded current page';
        },
    }),
    navigate_to_another_page: define({
        description: 'Navigate to another page',
        inputSchema: z.object({ itemId: z.string() }),
        execute: async (client: ClientSDK, { itemId }) => {
            await client.mutate('pages.context', {
                params: {
                    itemId,
                }
            });
            return 'Navigated to item: ' + itemId;
        },
    }),
}

export const clientSideTools = {
    get_current_page_context: tool({ ...tools.get_current_page_context, execute: undefined }),
    reload_current_page: tool({ ...tools.reload_current_page, execute: undefined }),
    navigate_to_another_page: tool({ ...tools.navigate_to_another_page, execute: undefined }),
}

export async function executeClientSideTool(client: ClientSDK, tool: string, input: any) {
    const toolFunction = tools[tool as keyof typeof tools] as ToolConfig<any>;
    if (!toolFunction) {
        throw new Error('Tool not found');
    }
    return toolFunction.execute(client, toolFunction.inputSchema.parse(input));
}
