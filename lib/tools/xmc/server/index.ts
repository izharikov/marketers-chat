import { experimental_XMC } from "@sitecore-marketplace-sdk/xmc";
import { JSONValue, Tool, tool } from "ai";
import { v4 as uuidv4 } from 'uuid';
import { assetToolsConfig, componentsToolsConfig, contentToolsConfig, pagesToolsConfig, sitesToolsConfig, jobToolsConfig, environmentToolsConfig, personalizationToolsConfig } from "../definitions";

type ToolConfig = {
    needsApproval?: boolean;
}

function wrapTool(commonConfig: ToolConfig) {
    return function <INPUT, OUTPUT>(params: Tool<INPUT, OUTPUT>) {
        return tool({
            ...params,
            ...commonConfig,
        });
    };
}

async function wrapAgentCall<TResult extends { data: any }>(call: (jobId: string) => Promise<TResult>) {
    const jobId = uuidv4();
    const response = await call(jobId);
    return { ...response.data, jobId };
};

export function assetTools(client: experimental_XMC, sitecoreContextId: string, config?: ToolConfig) {
    const wrapped = wrapTool(config ?? {});
    return {
        get_asset_information: wrapped({
            ...assetToolsConfig.get_asset_information,
            execute: async ({ assetId }) => {
                return await wrapAgentCall(async (jobId) => client.agent.assetsGetAssetInformation({
                    query: {
                        sitecoreContextId,
                    },
                    headers: {
                        'x-sc-job-id': jobId,
                    },
                    path: {
                        assetId,
                    }
                }));
            },
        }),
        search_assets: wrapped({
            ...assetToolsConfig.search_assets,
            execute: async ({ query, language, type }) => {
                return await wrapAgentCall(async (jobId) => client.agent.assetsSearchAssets({
                    headers: {
                        'x-sc-job-id': jobId,
                    },
                    query: {
                        sitecoreContextId,
                        query,
                        language,
                        type,
                    },
                }));
            }
        }),
        update_asset: wrapped({
            ...assetToolsConfig.update_asset,
            execute: async ({ assetId, fields, language, name, altText }) => {
                return await wrapAgentCall(async (jobId) => client.agent.assetsUpdateAsset({
                    headers: {
                        'x-sc-job-id': jobId,
                    },
                    query: {
                        sitecoreContextId,
                    },
                    path: {
                        assetId,
                    },
                    body: {
                        fields,
                        language,
                        name,
                        altText,
                    },
                }));
            }
        }),
        upload_asset: wrapped({
            ...assetToolsConfig.upload_asset,
            execute: async ({ fileUrl, name, itemPath, language, extension, siteName }) => {
                const arrayBuffer = await fetch(fileUrl).then(res => res.arrayBuffer());
                const file = new Blob([arrayBuffer]);
                return await wrapAgentCall(async (jobId) => client.agent.assetsUploadAsset({
                    headers: {
                        'x-sc-job-id': jobId,
                    },
                    query: {
                        sitecoreContextId,
                    },
                    body: {
                        file,
                        upload_request: JSON.stringify({ name, itemPath, language, extension, siteName })
                    }
                }));
            }
        })
    }
}

export function environmentTools(client: experimental_XMC, sitecoreContextId: string) {
    return {
        list_languages: tool({
            ...environmentToolsConfig.list_languages,
            execute: async () => {
                return await wrapAgentCall(async (jobId) => client.agent.environmentsListLanguages({
                    headers: {
                        'x-sc-job-id': jobId,
                    },
                    query: {
                        sitecoreContextId,
                    },
                }));
            }
        })
    }
}

export function personalizationTools(client: experimental_XMC, sitecoreContextId: string) {
    return {
        create_personalization_version: tool({
            ...personalizationToolsConfig.create_personalization_version,
            execute: async ({ pageId, name, variant_name, audience_name, condition_template_id, condition_params, language }) => {
                return await wrapAgentCall(async (jobId) => client.agent.personalizationCreatePersonalizationVersion({
                    headers: {
                        'x-sc-job-id': jobId,
                    },
                    path: {
                        pageId,
                    },
                    body: {
                        name,
                        variant_name,
                        audience_name,
                        condition_template_id,
                        condition_params,
                        language,
                    },
                    query: {
                        sitecoreContextId,
                    }
                }));
            }
        }),
        get_personalization_versions_by_page: tool({
            ...personalizationToolsConfig.get_personalization_versions_by_page,
            execute: async ({ pageId }) => {
                return await wrapAgentCall(async (jobId) => client.agent.personalizationGetPersonalizationVersionsByPage({
                    headers: {
                        'x-sc-job-id': jobId,
                    },
                    path: {
                        pageId,
                    },
                    query: {
                        sitecoreContextId,
                    }
                }));
            }
        }),
        get_condition_templates: tool({
            ...personalizationToolsConfig.get_condition_templates,
            execute: async () => {
                return await wrapAgentCall(async (jobId) => client.agent.personalizationGetConditionTemplates({
                    headers: {
                        'x-sc-job-id': jobId,
                    },
                    query: {
                        sitecoreContextId,
                    },
                }));
            }
        }),
        get_condition_template_by_id: tool({
            ...personalizationToolsConfig.get_condition_template_by_id,
            execute: async ({ templateId }) => {
                return await wrapAgentCall(async (jobId) => client.agent.personalizationGetConditionTemplateById({
                    headers: {
                        'x-sc-job-id': jobId,
                    },
                    path: {
                        template_id: templateId,
                    },
                    query: {
                        sitecoreContextId,
                    }
                }));
            }
        })
    }
}

export function jobTools(client: experimental_XMC, sitecoreContextId: string) {
    return {
        revert_job: tool({
            ...jobToolsConfig.revert_job,
            execute: async ({ jobId }) => {
                return await wrapAgentCall(async (jobId) => client.agent.jobsRevertJob({
                    headers: {
                        'x-sc-job-id': jobId,
                    },
                    path: {
                        jobId,
                    },
                    query: {
                        sitecoreContextId,
                    }
                }));
            }
        }),
        get_job: tool({
            ...jobToolsConfig.get_job,
            execute: async ({ jobId }) => {
                return await wrapAgentCall(async (jobId) => client.agent.jobsGetJob({
                    headers: {
                        'x-sc-job-id': jobId,
                    },
                    path: {
                        jobId,
                    },
                    query: {
                        sitecoreContextId,
                    }
                }));
            }
        }),
        list_operations: tool({
            ...jobToolsConfig.list_operations,
            execute: async ({ jobId }) => {
                return await wrapAgentCall(async (jobId) => client.agent.jobsListOperations({
                    headers: {
                        'x-sc-job-id': jobId,
                    },
                    path: {
                        jobId,
                    },
                    query: {
                        sitecoreContextId,
                    }
                }));
            }
        })
    }
}

export function pagesTools(client: experimental_XMC, sitecoreContextId: string) {
    return {
        get_page: tool({
            ...pagesToolsConfig.get_page,
            execute: async ({ pageId, language }) => {
                return await wrapAgentCall(async (jobId) => client.agent.pagesGetPage({
                    headers: {
                        'x-sc-job-id': jobId,
                    },
                    path: {
                        pageId,
                    },
                    query: {
                        language,
                        sitecoreContextId,
                    }
                }));
            }
        }),
        create_page: tool({
            ...pagesToolsConfig.create_page,
            execute: async ({ templateId, name, parentId, language, fields }) => {
                return await wrapAgentCall(async (jobId) => client.agent.pagesCreatePage({
                    headers: {
                        'x-sc-job-id': jobId,
                    },
                    body: {
                        templateId,
                        name,
                        parentId,
                        language,
                        fields,
                    },
                    query: {
                        sitecoreContextId,
                    }
                }));
            }
        }),
        get_page_template_by_id: tool({
            ...pagesToolsConfig.get_page_template_by_id,
            execute: async ({ templateId }) => {
                return await wrapAgentCall(async (jobId) => client.agent.pagesGetPageTemplateById({
                    headers: {
                        'x-sc-job-id': jobId,
                    },
                    query: {
                        templateId,
                        sitecoreContextId,
                    }
                }));
            }
        }),
        get_allowed_components_by_placeholder: tool({
            ...pagesToolsConfig.get_allowed_components_by_placeholder,
            execute: async ({ pageId, placeholderName, language }) => {
                return await wrapAgentCall(async (jobId) => client.agent.pagesGetAllowedComponentsByPlaceholder({
                    headers: {
                        'x-sc-job-id': jobId,
                    },
                    path: {
                        pageId,
                        placeholderName,
                    },
                    query: {
                        language,
                        sitecoreContextId,
                    }
                }));
            }
        }),
        get_components_on_page: tool({
            ...pagesToolsConfig.get_components_on_page,
            execute: async ({ pageId, language, version }) => {
                return await wrapAgentCall(async (jobId) => client.agent.pagesGetComponentsOnPage({
                    headers: {
                        'x-sc-job-id': jobId,
                    },
                    path: {
                        pageId,
                    },
                    query: {
                        language,
                        version,
                        sitecoreContextId,
                    }
                }));
            }
        }),
        add_component_on_page: tool({
            ...pagesToolsConfig.add_component_on_page,
            execute: async ({ pageId, componentRenderingId, placeholderPath, componentItemName, language, fields }) => {
                return await wrapAgentCall(async (jobId) => client.agent.pagesAddComponentOnPage({
                    headers: {
                        'x-sc-job-id': jobId,
                    },
                    path: {
                        pageId,
                    },
                    body: {
                        componentRenderingId,
                        placeholderPath,
                        componentItemName,
                        language,
                        fields,
                    },
                    query: {
                        sitecoreContextId,
                    }
                }));
            }
        }),
        set_component_datasource: tool({
            ...pagesToolsConfig.set_component_datasource,
            execute: async ({ pageId, componentId, datasourceId, language }) => {
                return await wrapAgentCall(async (jobId) => client.agent.pagesSetComponentDatasource({
                    headers: {
                        'x-sc-job-id': jobId,
                    },
                    path: {
                        pageId,
                        componentId,
                    },
                    body: {
                        datasourceId,
                        language,
                    },
                    query: {
                        sitecoreContextId,
                    }
                }));
            }
        }),
        add_language_to_page: tool({
            ...pagesToolsConfig.add_language_to_page,
            execute: async ({ pageId, language }) => {
                return await wrapAgentCall(async (jobId) => client.agent.pagesAddLanguageToPage({
                    headers: {
                        'x-sc-job-id': jobId,
                    },
                    path: {
                        pageId,
                    },
                    body: {
                        language,
                    },
                    query: {
                        sitecoreContextId,
                    }
                }));
            }
        }),
        search_site: tool({
            ...pagesToolsConfig.search_site,
            execute: async ({ search_query, site_name, language }) => {
                return await wrapAgentCall(async (jobId) => client.agent.pagesSearchSite({
                    headers: {
                        'x-sc-job-id': jobId,
                    },
                    query: {
                        search_query,
                        site_name,
                        language,
                        sitecoreContextId,
                    }
                }));
            }
        }),
        get_page_path_by_live_url: tool({
            ...pagesToolsConfig.get_page_path_by_live_url,
            execute: async ({ live_url }) => {
                return await wrapAgentCall(async (jobId) => client.agent.pagesGetPagePathByLiveUrl({
                    headers: {
                        'x-sc-job-id': jobId,
                    },
                    query: {
                        live_url,
                        sitecoreContextId,
                    }
                }));
            }
        }),
        get_page_screenshot: tool({
            ...pagesToolsConfig.get_page_screenshot,
            execute: async ({ pageId, version, language, width, height }) => {
                return await wrapAgentCall(async (jobId) => client.agent.pagesGetPageScreenshot({
                    headers: {
                        'x-sc-job-id': jobId,
                    },
                    path: {
                        pageId,
                    },
                    query: {
                        version,
                        language,
                        width,
                        height,
                        sitecoreContextId,
                    }
                }));
            }
        }),
        get_page_html: tool({
            ...pagesToolsConfig.get_page_html,
            execute: async ({ pageId, language, version }) => {
                return await wrapAgentCall(async (jobId) => client.agent.pagesGetPageHtml({
                    headers: {
                        'x-sc-job-id': jobId,
                    },
                    path: {
                        pageId,
                    },
                    query: {
                        language,
                        version,
                        sitecoreContextId,
                    }
                }));
            }
        }),
        get_page_preview_url: tool({
            ...pagesToolsConfig.get_page_preview_url,
            execute: async ({ pageId, language, version }) => {
                return await wrapAgentCall(async (jobId) => client.agent.pagesGetPagePreviewUrl({
                    headers: {
                        'x-sc-job-id': jobId,
                    },
                    path: {
                        pageId,
                    },
                    query: {
                        language,
                        version,
                        sitecoreContextId,
                    }
                }));
            }
        })
    }
}

export function sitesTools(client: experimental_XMC, sitecoreContextId: string, config?: ToolConfig) {
    const wrapped = wrapTool(config ?? {});
    return {
        get_sites_list: wrapped({
            ...sitesToolsConfig.get_sites_list,
            execute: async () => {
                return await wrapAgentCall(async (jobId) => client.agent.sitesGetSitesList({
                    headers: {
                        'x-sc-job-id': jobId,
                    },
                    query: {
                        sitecoreContextId,
                    }
                }));
            }
        }),
        get_site_details: wrapped({
            ...sitesToolsConfig.get_site_details,
            execute: async ({ siteId }) => {
                return await wrapAgentCall(async (jobId) => client.agent.sitesGetSiteDetails({
                    headers: {
                        'x-sc-job-id': jobId,
                    },
                    path: {
                        siteId,
                    },
                    query: {
                        sitecoreContextId,
                    }
                }));
            }
        }),
        get_all_pages_by_site: wrapped({
            ...sitesToolsConfig.get_all_pages_by_site,
            execute: async ({ siteName, language }) => {
                return await wrapAgentCall(async (jobId) => client.agent.sitesGetAllPagesBySite({
                    headers: {
                        'x-sc-job-id': jobId,
                    },
                    path: {
                        siteName,
                    },
                    query: {
                        language,
                        sitecoreContextId,
                    }
                }));
            }
        }),
        get_site_id_from_item: wrapped({
            ...sitesToolsConfig.get_site_id_from_item,
            execute: async ({ itemId }) => {
                return await wrapAgentCall(async (jobId) => client.agent.sitesGetSiteIdFromItem({
                    headers: {
                        'x-sc-job-id': jobId,
                    },
                    path: {
                        itemId,
                    },
                    query: {
                        sitecoreContextId,
                    }
                }));
            }
        })
    }
}

export function contentTools(client: experimental_XMC, sitecoreContextId: string) {
    return {
        create_content_item: tool({
            ...contentToolsConfig.create_content_item,
            execute: async ({ templateId, name, parentId, language, fields }) => {
                return await wrapAgentCall(async (jobId) => client.agent.contentCreateContentItem({
                    headers: {
                        'x-sc-job-id': jobId,
                    },
                    body: {
                        templateId,
                        name,
                        parentId,
                        language,
                        fields,
                    },
                    query: {
                        sitecoreContextId,
                    }
                }));
            }
        }),
        delete_content: tool({
            ...contentToolsConfig.delete_content,
            execute: async ({ itemId, language }) => {
                return await wrapAgentCall(async (jobId) => client.agent.contentDeleteContent({
                    headers: {
                        'x-sc-job-id': jobId,
                    },
                    path: {
                        itemId,
                    },
                    query: {
                        language,
                        sitecoreContextId,
                    }
                }));
            }
        }),
        get_content_item_by_id: tool({
            ...contentToolsConfig.get_content_item_by_id,
            execute: async ({ itemId, language }) => {
                return await wrapAgentCall(async (jobId) => client.agent.contentGetContentItemById({
                    headers: {
                        'x-sc-job-id': jobId,
                    },
                    path: {
                        itemId,
                    },
                    query: {
                        language,
                        sitecoreContextId,
                    }
                }));
            }
        }),
        update_content: tool({
            ...contentToolsConfig.update_content,
            execute: async ({ itemId, fields, language, createNewVersion, siteName }) => {
                return await wrapAgentCall(async (jobId) => client.agent.contentUpdateContent({
                    headers: {
                        'x-sc-job-id': jobId,
                    },
                    path: {
                        itemId,
                    },
                    body: {
                        fields,
                        language,
                        createNewVersion,
                        siteName,
                    },
                    query: {
                        sitecoreContextId,
                    }
                }));
            }
        }),
        get_content_item_by_path: tool({
            ...contentToolsConfig.get_content_item_by_path,
            execute: async ({ item_path, failOnNotFound, language }) => {
                return await wrapAgentCall(async (jobId) => client.agent.contentGetContentItemByPath({
                    headers: {
                        'x-sc-job-id': jobId,
                    },
                    query: {
                        item_path,
                        failOnNotFound,
                        language,
                        sitecoreContextId,
                    }
                }));
            }
        }),
        list_available_insert_options: tool({
            ...contentToolsConfig.list_available_insert_options,
            execute: async ({ itemId, language }) => {
                return await wrapAgentCall(async (jobId) => client.agent.contentListAvailableInsertoptions({
                    headers: {
                        'x-sc-job-id': jobId,
                    },
                    path: {
                        itemId,
                    },
                    query: {
                        language,
                        sitecoreContextId,
                    }
                }));
            }
        })
    }
}

export function componentsTools(client: experimental_XMC, sitecoreContextId: string) {
    return {
        create_component_datasource: tool({
            ...componentsToolsConfig.create_component_datasource,
            execute: async ({ componentId, siteName, dataFields, children, language }) => {
                return await wrapAgentCall(async (jobId) => client.agent.componentsCreateComponentDatasource({
                    headers: {
                        'x-sc-job-id': jobId,
                    },
                    path: {
                        componentId,
                    },
                    body: {
                        siteName,
                        dataFields,
                        children,
                        language,
                    },
                    query: {
                        sitecoreContextId,
                    }
                }));
            }
        }),
        search_component_datasources: tool({
            ...componentsToolsConfig.search_component_datasources,
            execute: async ({ componentId, term }) => {
                return await wrapAgentCall(async (jobId) => client.agent.componentsSearchComponentDatasources({
                    headers: {
                        'x-sc-job-id': jobId,
                    },
                    path: {
                        componentId,
                    },
                    query: {
                        term,
                        sitecoreContextId,
                    }
                }));
            }
        }),
        list_components: tool({
            ...componentsToolsConfig.list_components,
            execute: async ({ site_name }) => {
                return await wrapAgentCall(async (jobId) => client.agent.componentsListComponents({
                    headers: {
                        'x-sc-job-id': jobId,
                    },
                    query: {
                        site_name,
                        sitecoreContextId,
                    }
                }));
            }
        }),
        get_component: tool({
            ...componentsToolsConfig.get_component,
            execute: async ({ componentId }) => {
                return await wrapAgentCall(async (jobId) => client.agent.componentsGetComponent({
                    headers: {
                        'x-sc-job-id': jobId,
                    },
                    path: {
                        componentId,
                    },
                    query: {
                        sitecoreContextId,
                    }
                }));
            }
        })
    }
}
