import { ClientSDK } from "@sitecore-marketplace-sdk/client";
import { sitesToolsConfig } from "../config";
import { clientQuery, clientTool } from "./helpers";

export const sitesTools = {
    get_sites_list: clientTool({
        ...sitesToolsConfig.get_sites_list,
        execute: async (client, sitecoreContextId) => {
            return await clientQuery(client, 'xmc.agent.sitesGetSitesList', {
                params: {
                    query: {
                        sitecoreContextId,
                    },
                }
            })
        },
    }),
    get_site_details: clientTool({
        ...sitesToolsConfig.get_site_details,
        execute: async (client, sitecoreContextId, { siteId }) => {
            return await clientQuery(client, 'xmc.agent.sitesGetSiteDetails', {
                params: {
                    path: {
                        siteId,
                    },
                    query: {
                        sitecoreContextId,
                    },
                }
            });
        },
    }),
    get_all_pages_by_site: clientTool({
        ...sitesToolsConfig.get_all_pages_by_site,
        execute: async (client, sitecoreContextId, { siteName, language }) => {
            return await clientQuery(client, 'xmc.agent.sitesGetAllPagesBySite', {
                params: {
                    path: {
                        siteName,
                    },
                    query: {
                        sitecoreContextId,
                        language,
                    },
                }
            });
        },
    }),
    get_site_id_from_item: clientTool({
        ...sitesToolsConfig.get_site_id_from_item,
        execute: async (client, sitecoreContextId, { itemId }) => {
            return await clientQuery(client, 'xmc.agent.sitesGetSiteIdFromItem', {
                params: {
                    path: {
                        itemId,
                    },
                    query: {
                        sitecoreContextId,
                    },
                }
            });
        },
    }),
}

const allTools = {
    ...sitesTools,
}

export function runClientTool(client: ClientSDK, sitecoreContextId: string | undefined,
    toolCall: { toolCallId: string, toolName: string, input: any }
) {
    const tool = allTools[toolCall.toolName as keyof typeof allTools];
    if (!tool) {
        return undefined;
    }
    return tool(client, sitecoreContextId, toolCall.input);
}
