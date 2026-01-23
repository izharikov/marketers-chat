import { ClientSDK } from "@sitecore-marketplace-sdk/client";
import {
    assetToolsConfig,
    environmentToolsConfig,
    personalizationToolsConfig,
    jobToolsConfig,
    pagesToolsConfig,
    sitesToolsConfig,
    contentToolsConfig,
    componentsToolsConfig
} from "../config";
import { clientQuery, clientMutate, clientTool } from "./helpers";

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

export const assetTools = {
    get_asset_information: clientTool({
        ...assetToolsConfig.get_asset_information,
        execute: async (client, sitecoreContextId, { assetId }) => {
            return await clientQuery(client, 'xmc.agent.assetsGetAssetInformation', {
                params: {
                    path: { assetId },
                    query: { sitecoreContextId },
                }
            });
        },
    }),
    search_assets: clientTool({
        ...assetToolsConfig.search_assets,
        execute: async (client, sitecoreContextId, { query, language, type }) => {
            return await clientQuery(client, 'xmc.agent.assetsSearchAssets', {
                params: {
                    query: { sitecoreContextId, query, language, type },
                }
            });
        },
    }),
    update_asset: clientTool({
        ...assetToolsConfig.update_asset,
        execute: async (client, sitecoreContextId, { assetId, fields, language, name, altText }) => {
            return await clientMutate(client, 'xmc.agent.assetsUpdateAsset', {
                params: {
                    path: { assetId },
                    query: { sitecoreContextId },
                    body: { fields, language, name, altText },
                }
            });
        },
    }),
    upload_asset: clientTool({
        ...assetToolsConfig.upload_asset,
        execute: async (client, sitecoreContextId, { fileUrl, name, itemPath, language, extension, siteName }) => {
            const arrayBuffer = await fetch(fileUrl).then(res => res.arrayBuffer());
            const file = new Blob([arrayBuffer]);
            return await clientMutate(client, 'xmc.agent.assetsUploadAsset', {
                params: {
                    query: { sitecoreContextId },
                    body: {
                        file,
                        upload_request: JSON.stringify({ name, itemPath, language, extension, siteName })
                    }
                }
            });
        },
    }),
}

export const environmentTools = {
    list_languages: clientTool({
        ...environmentToolsConfig.list_languages,
        execute: async (client, sitecoreContextId) => {
            return await clientQuery(client, 'xmc.agent.environmentsListLanguages', {
                params: {
                    query: { sitecoreContextId },
                }
            });
        },
    }),
}

export const personalizationTools = {
    create_personalization_version: clientTool({
        ...personalizationToolsConfig.create_personalization_version,
        execute: async (client, sitecoreContextId, { pageId, name, variant_name, audience_name, condition_template_id, condition_params, language }) => {
            return await clientMutate(client, 'xmc.agent.personalizationCreatePersonalizationVersion', {
                params: {
                    path: { pageId },
                    query: { sitecoreContextId },
                    body: { name, variant_name, audience_name, condition_template_id, condition_params, language },
                }
            });
        },
    }),
    get_personalization_versions_by_page: clientTool({
        ...personalizationToolsConfig.get_personalization_versions_by_page,
        execute: async (client, sitecoreContextId, { pageId }) => {
            return await clientQuery(client, 'xmc.agent.personalizationGetPersonalizationVersionsByPage', {
                params: {
                    path: { pageId },
                    query: { sitecoreContextId },
                }
            });
        },
    }),
    get_condition_templates: clientTool({
        ...personalizationToolsConfig.get_condition_templates,
        execute: async (client, sitecoreContextId) => {
            return await clientQuery(client, 'xmc.agent.personalizationGetConditionTemplates', {
                params: {
                    query: { sitecoreContextId },
                }
            });
        },
    }),
    get_condition_template_by_id: clientTool({
        ...personalizationToolsConfig.get_condition_template_by_id,
        execute: async (client, sitecoreContextId, { templateId }) => {
            return await clientQuery(client, 'xmc.agent.personalizationGetConditionTemplateById', {
                params: {
                    path: { template_id: templateId },
                    query: { sitecoreContextId },
                }
            });
        },
    }),
}

export const jobTools = {
    revert_job: clientTool({
        ...jobToolsConfig.revert_job,
        execute: async (client, sitecoreContextId, { jobId }) => {
            return await clientMutate(client, 'xmc.agent.jobsRevertJob', {
                params: {
                    path: { jobId },
                    query: { sitecoreContextId },
                }
            });
        },
    }),
    get_job: clientTool({
        ...jobToolsConfig.get_job,
        execute: async (client, sitecoreContextId, { jobId }) => {
            return await clientQuery(client, 'xmc.agent.jobsGetJob', {
                params: {
                    path: { jobId },
                    query: { sitecoreContextId },
                }
            });
        },
    }),
    list_operations: clientTool({
        ...jobToolsConfig.list_operations,
        execute: async (client, sitecoreContextId, { jobId }) => {
            return await clientQuery(client, 'xmc.agent.jobsListOperations', {
                params: {
                    path: { jobId },
                    query: { sitecoreContextId },
                }
            });
        },
    }),
}

export const pagesTools = {
    get_page: clientTool({
        ...pagesToolsConfig.get_page,
        execute: async (client, sitecoreContextId, { pageId, language }) => {
            return await clientQuery(client, 'xmc.agent.pagesGetPage', {
                params: {
                    path: { pageId },
                    query: { language, sitecoreContextId },
                }
            });
        },
    }),
    create_page: clientTool({
        ...pagesToolsConfig.create_page,
        execute: async (client, sitecoreContextId, { templateId, name, parentId, language, fields }) => {
            return await clientMutate(client, 'xmc.agent.pagesCreatePage', {
                params: {
                    query: { sitecoreContextId },
                    body: { templateId, name, parentId, language, fields },
                }
            });
        },
    }),
    get_page_template_by_id: clientTool({
        ...pagesToolsConfig.get_page_template_by_id,
        execute: async (client, sitecoreContextId, { templateId }) => {
            return await clientQuery(client, 'xmc.agent.pagesGetPageTemplateById', {
                params: {
                    query: { templateId, sitecoreContextId },
                }
            });
        },
    }),
    get_allowed_components_by_placeholder: clientTool({
        ...pagesToolsConfig.get_allowed_components_by_placeholder,
        execute: async (client, sitecoreContextId, { pageId, placeholderName, language }) => {
            return await clientQuery(client, 'xmc.agent.pagesGetAllowedComponentsByPlaceholder', {
                params: {
                    path: { pageId, placeholderName },
                    query: { language, sitecoreContextId },
                }
            });
        },
    }),
    get_components_on_page: clientTool({
        ...pagesToolsConfig.get_components_on_page,
        execute: async (client, sitecoreContextId, { pageId, language, version }) => {
            return await clientQuery(client, 'xmc.agent.pagesGetComponentsOnPage', {
                params: {
                    path: { pageId },
                    query: { language, version, sitecoreContextId },
                }
            });
        },
    }),
    add_component_on_page: clientTool({
        ...pagesToolsConfig.add_component_on_page,
        execute: async (client, sitecoreContextId, { pageId, componentRenderingId, placeholderPath, componentItemName, language, fields }) => {
            return await clientMutate(client, 'xmc.agent.pagesAddComponentOnPage', {
                params: {
                    path: { pageId },
                    query: { sitecoreContextId },
                    body: { componentRenderingId, placeholderPath, componentItemName, language, fields },
                }
            });
        },
    }),
    set_component_datasource: clientTool({
        ...pagesToolsConfig.set_component_datasource,
        execute: async (client, sitecoreContextId, { pageId, componentId, datasourceId, language }) => {
            return await clientMutate(client, 'xmc.agent.pagesSetComponentDatasource', {
                params: {
                    path: { pageId, componentId },
                    query: { sitecoreContextId },
                    body: { datasourceId, language },
                }
            });
        },
    }),
    add_language_to_page: clientTool({
        ...pagesToolsConfig.add_language_to_page,
        execute: async (client, sitecoreContextId, { pageId, language }) => {
            return await clientMutate(client, 'xmc.agent.pagesAddLanguageToPage', {
                params: {
                    path: { pageId },
                    query: { sitecoreContextId },
                    body: { language },
                }
            });
        },
    }),
    search_site: clientTool({
        ...pagesToolsConfig.search_site,
        execute: async (client, sitecoreContextId, { search_query, site_name, language }) => {
            return await clientQuery(client, 'xmc.agent.pagesSearchSite', {
                params: {
                    query: { search_query, site_name, language, sitecoreContextId },
                }
            });
        },
    }),
    get_page_path_by_live_url: clientTool({
        ...pagesToolsConfig.get_page_path_by_live_url,
        execute: async (client, sitecoreContextId, { live_url }) => {
            return await clientQuery(client, 'xmc.agent.pagesGetPagePathByLiveUrl', {
                params: {
                    query: { live_url, sitecoreContextId },
                }
            });
        },
    }),
    get_page_screenshot: clientTool({
        ...pagesToolsConfig.get_page_screenshot,
        execute: async (client, sitecoreContextId, { pageId, version, language, width, height }) => {
            return await clientQuery(client, 'xmc.agent.pagesGetPageScreenshot', {
                params: {
                    path: { pageId },
                    query: { version, language, width, height, sitecoreContextId },
                }
            });
        },
    }),
    get_page_html: clientTool({
        ...pagesToolsConfig.get_page_html,
        execute: async (client, sitecoreContextId, { pageId, language, version }) => {
            return await clientQuery(client, 'xmc.agent.pagesGetPageHtml', {
                params: {
                    path: { pageId },
                    query: { language, version, sitecoreContextId },
                }
            });
        },
    }),
    get_page_preview_url: clientTool({
        ...pagesToolsConfig.get_page_preview_url,
        execute: async (client, sitecoreContextId, { pageId, language, version }) => {
            return await clientQuery(client, 'xmc.agent.pagesGetPagePreviewUrl', {
                params: {
                    path: { pageId },
                    query: { language, version, sitecoreContextId },
                }
            });
        },
    }),
}

export const contentTools = {
    create_content_item: clientTool({
        ...contentToolsConfig.create_content_item,
        execute: async (client, sitecoreContextId, { templateId, name, parentId, language, fields }) => {
            return await clientMutate(client, 'xmc.agent.contentCreateContentItem', {
                params: {
                    query: { sitecoreContextId },
                    body: { templateId, name, parentId, language, fields },
                }
            });
        },
    }),
    delete_content: clientTool({
        ...contentToolsConfig.delete_content,
        execute: async (client, sitecoreContextId, { itemId, language }) => {
            return await clientMutate(client, 'xmc.agent.contentDeleteContent', {
                params: {
                    path: { itemId },
                    query: { language, sitecoreContextId },
                }
            });
        },
    }),
    get_content_item_by_id: clientTool({
        ...contentToolsConfig.get_content_item_by_id,
        execute: async (client, sitecoreContextId, { itemId, language }) => {
            return await clientQuery(client, 'xmc.agent.contentGetContentItemById', {
                params: {
                    path: { itemId },
                    query: { language, sitecoreContextId },
                }
            });
        },
    }),
    update_content: clientTool({
        ...contentToolsConfig.update_content,
        execute: async (client, sitecoreContextId, { itemId, fields, language, createNewVersion, siteName }) => {
            return await clientMutate(client, 'xmc.agent.contentUpdateContent', {
                params: {
                    path: { itemId },
                    query: { sitecoreContextId },
                    body: { fields, language, createNewVersion, siteName },
                }
            });
        },
    }),
    get_content_item_by_path: clientTool({
        ...contentToolsConfig.get_content_item_by_path,
        execute: async (client, sitecoreContextId, { item_path, failOnNotFound, language }) => {
            return await clientQuery(client, 'xmc.agent.contentGetContentItemByPath', {
                params: {
                    query: { item_path, failOnNotFound, language, sitecoreContextId },
                }
            });
        },
    }),
    list_available_insert_options: clientTool({
        ...contentToolsConfig.list_available_insert_options,
        execute: async (client, sitecoreContextId, { itemId, language }) => {
            return await clientQuery(client, 'xmc.agent.contentListAvailableInsertoptions', {
                params: {
                    path: { itemId },
                    query: { language, sitecoreContextId },
                }
            });
        },
    }),
}

export const clientComponentsTools = {
    create_component_datasource: clientTool({
        ...componentsToolsConfig.create_component_datasource,
        execute: async (client, sitecoreContextId, { componentId, siteName, dataFields, children, language }) => {
            return await clientMutate(client, 'xmc.agent.componentsCreateComponentDatasource', {
                params: {
                    path: { componentId },
                    query: { sitecoreContextId },
                    body: { siteName, dataFields, children, language },
                }
            });
        },
    }),
    search_component_datasources: clientTool({
        ...componentsToolsConfig.search_component_datasources,
        execute: async (client, sitecoreContextId, { componentId, term }) => {
            return await clientQuery(client, 'xmc.agent.componentsSearchComponentDatasources', {
                params: {
                    path: { componentId },
                    query: { term, sitecoreContextId },
                }
            });
        },
    }),
    list_components: clientTool({
        ...componentsToolsConfig.list_components,
        execute: async (client, sitecoreContextId, { site_name }) => {
            return await clientQuery(client, 'xmc.agent.componentsListComponents', {
                params: {
                    query: { site_name, sitecoreContextId },
                }
            });
        },
    }),
    get_component: clientTool({
        ...componentsToolsConfig.get_component,
        execute: async (client, sitecoreContextId, { componentId }) => {
            return await clientQuery(client, 'xmc.agent.componentsGetComponent', {
                params: {
                    path: { componentId },
                    query: { sitecoreContextId },
                }
            });
        },
    }),
}

const allTools = {
    ...assetTools,
    ...environmentTools,
    ...personalizationTools,
    ...jobTools,
    ...pagesTools,
    ...sitesTools,
    ...contentTools,
    ...clientComponentsTools,
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
