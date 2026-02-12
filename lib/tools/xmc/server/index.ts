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

async function wrapAgentCall<TResult extends { data: any }>(call: () => Promise<TResult>) {
    const response = await call();
    if ('error' in response) {
        throw response.error;
    }
    return { ...response.data };
};

async function callWithJobId<TResult extends { data: any }>(call: (jobId: string) => Promise<TResult>) {
    const jobId = uuidv4();
    const response = await call(jobId);
    if ('error' in response) {
        throw response.error;
    }
    return { ...response.data, jobId };
};

export function assetTools(client: experimental_XMC, sitecoreContextId: string, config?: ToolConfig) {
    const wrapped = wrapTool(config ?? {});
    return {
        get_asset_information: wrapped({
            ...assetToolsConfig.get_asset_information,
            execute: async ({ assetId }) => {
                return await wrapAgentCall(async () => client.agent.assetsGetAssetInformation({
                    query: {
                        sitecoreContextId,
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
                return await wrapAgentCall(async () => client.agent.assetsSearchAssets({
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
                return await callWithJobId(async (jobId) => client.agent.assetsUpdateAsset({
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
                return await callWithJobId(async (jobId) => client.agent.assetsUploadAsset({
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

export function environmentTools(client: experimental_XMC, sitecoreContextId: string, config?: ToolConfig) {
    const wrapped = wrapTool(config ?? {});
    return {
        list_languages: wrapped({
            ...environmentToolsConfig.list_languages,
            execute: async () => {
                return await wrapAgentCall(async () => client.agent.environmentsListLanguages({
                    query: {
                        sitecoreContextId,
                    },
                }));
            }
        })
    }
}

export function personalizationTools(client: experimental_XMC, sitecoreContextId: string, config?: ToolConfig) {
    const wrapped = wrapTool(config ?? {});
    return {
        create_personalization_version: wrapped({
            ...personalizationToolsConfig.create_personalization_version,
            execute: async ({ pageId, name, variant_name, audience_name, condition_template_id, condition_params, language }) => {
                return await callWithJobId(async (jobId) => client.agent.personalizationCreatePersonalizationVersion({
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
        get_personalization_versions_by_page: wrapped({
            ...personalizationToolsConfig.get_personalization_versions_by_page,
            execute: async ({ pageId }) => {
                return await wrapAgentCall(async () => client.agent.personalizationGetPersonalizationVersionsByPage({
                    path: {
                        pageId,
                    },
                    query: {
                        sitecoreContextId,
                    }
                }));
            }
        }),
        get_condition_templates: wrapped({
            ...personalizationToolsConfig.get_condition_templates,
            execute: async () => {
                return await wrapAgentCall(async () => client.agent.personalizationGetConditionTemplates({
                    query: {
                        sitecoreContextId,
                    },
                }));
            }
        }),
        get_condition_template_by_id: wrapped({
            ...personalizationToolsConfig.get_condition_template_by_id,
            execute: async ({ templateId }) => {
                return await wrapAgentCall(async () => client.agent.personalizationGetConditionTemplateById({
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

export function jobTools(client: experimental_XMC, sitecoreContextId: string, config?: ToolConfig) {
    const wrapped = wrapTool(config ?? {});
    return {
        revert_job: wrapped({
            ...jobToolsConfig.revert_job,
            execute: async ({ jobId }) => {
                return await wrapAgentCall(async () => client.agent.jobsRevertJob({
                    path: {
                        jobId,
                    },
                    query: {
                        sitecoreContextId,
                    }
                }));
            }
        }),
        get_job: wrapped({
            ...jobToolsConfig.get_job,
            execute: async ({ jobId }) => {
                return await wrapAgentCall(async () => client.agent.jobsGetJob({
                    path: {
                        jobId,
                    },
                    query: {
                        sitecoreContextId,
                    }
                }));
            }
        }),
        list_operations: wrapped({
            ...jobToolsConfig.list_operations,
            execute: async ({ jobId }) => {
                return await wrapAgentCall(async () => client.agent.jobsListOperations({
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

export function pagesTools(client: experimental_XMC, sitecoreContextId: string, config?: ToolConfig) {
    const wrapped = wrapTool(config ?? {});
    return {
        get_page: wrapped({
            ...pagesToolsConfig.get_page,
            execute: async ({ pageId, language }) => {
                return await wrapAgentCall(async () => client.agent.pagesGetPage({
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
        create_page: wrapped({
            ...pagesToolsConfig.create_page,
            execute: async ({ templateId, name, parentId, language, fields }) => {
                return await callWithJobId(async (jobId) => client.agent.pagesCreatePage({
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
        get_page_template_by_id: wrapped({
            ...pagesToolsConfig.get_page_template_by_id,
            execute: async ({ templateId }) => {
                return await wrapAgentCall(async () => client.agent.pagesGetPageTemplateById({
                    query: {
                        templateId,
                        sitecoreContextId,
                    }
                }));
            }
        }),
        get_allowed_components_by_placeholder: wrapped({
            ...pagesToolsConfig.get_allowed_components_by_placeholder,
            execute: async ({ pageId, placeholderName, language }) => {
                const fixedPlaceholder = placeholderName.split('/').findLast((p) => p !== '');
                return await wrapAgentCall(async () => client.agent.pagesGetAllowedComponentsByPlaceholder({
                    path: {
                        pageId,
                        placeholderName: fixedPlaceholder!,
                    },
                    query: {
                        language,
                        sitecoreContextId,
                    }
                }));
            }
        }),
        get_components_on_page: wrapped({
            ...pagesToolsConfig.get_components_on_page,
            execute: async ({ pageId, language, version }) => {
                return await wrapAgentCall(async () => client.agent.pagesGetComponentsOnPage({
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
        add_component_on_page: wrapped({
            ...pagesToolsConfig.add_component_on_page,
            execute: async ({ pageId, componentId, placeholderPath, componentItemName, language, fields }) => {
                return await callWithJobId(async (jobId) => client.agent.pagesAddComponentOnPage({
                    headers: {
                        'x-sc-job-id': jobId,
                    },
                    path: {
                        pageId,
                    },
                    body: {
                        componentRenderingId: componentId,
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
        set_component_datasource: wrapped({
            ...pagesToolsConfig.set_component_datasource,
            execute: async ({ pageId, componentId, datasourceId, language }) => {
                return await callWithJobId(async (jobId) => client.agent.pagesSetComponentDatasource({
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
        add_language_to_page: wrapped({
            ...pagesToolsConfig.add_language_to_page,
            execute: async ({ pageId, language }) => {
                return await callWithJobId(async (jobId) => client.agent.pagesAddLanguageToPage({
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
        search_site: wrapped({
            ...pagesToolsConfig.search_site,
            execute: async ({ search_query, site_name, language }) => {
                return await wrapAgentCall(async () => client.agent.pagesSearchSite({
                    query: {
                        search_query,
                        site_name,
                        language,
                        sitecoreContextId,
                    }
                }));
            }
        }),
        get_page_path_by_live_url: wrapped({
            ...pagesToolsConfig.get_page_path_by_live_url,
            execute: async ({ live_url }) => {
                return await wrapAgentCall(async () => client.agent.pagesGetPagePathByLiveUrl({
                    query: {
                        live_url,
                        sitecoreContextId,
                    }
                }));
            }
        }),
        get_page_screenshot: wrapped({
            ...pagesToolsConfig.get_page_screenshot,
            execute: async ({ pageId, version, language, width, height }) => {
                return await wrapAgentCall(async () => client.agent.pagesGetPageScreenshot({
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
        get_page_html: wrapped({
            ...pagesToolsConfig.get_page_html,
            execute: async ({ pageId, language, version }) => {
                return await wrapAgentCall(async () => client.agent.pagesGetPageHtml({
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
        get_page_preview_url: wrapped({
            ...pagesToolsConfig.get_page_preview_url,
            execute: async ({ pageId, language, version }) => {
                return await wrapAgentCall(async () => client.agent.pagesGetPagePreviewUrl({
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
                return await wrapAgentCall(async () => client.agent.sitesGetSitesList({
                    query: {
                        sitecoreContextId,
                    }
                }));
            }
        }),
        get_site_details: wrapped({
            ...sitesToolsConfig.get_site_details,
            execute: async ({ siteId }) => {
                return await wrapAgentCall(async () => client.agent.sitesGetSiteDetails({
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
                return await wrapAgentCall(async () => client.agent.sitesGetAllPagesBySite({
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
                return await wrapAgentCall(async () => client.agent.sitesGetSiteIdFromItem({
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

export function contentTools(client: experimental_XMC, sitecoreContextId: string, config?: ToolConfig) {
    const wrapped = wrapTool(config ?? {});
    return {
        create_content_item: wrapped({
            ...contentToolsConfig.create_content_item,
            execute: async ({ templateId, name, parentId, language, fields }) => {
                return await callWithJobId(async (jobId) => client.agent.contentCreateContentItem({
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
        delete_content: wrapped({
            ...contentToolsConfig.delete_content,
            execute: async ({ itemId, language }) => {
                return await callWithJobId(async (jobId) => client.agent.contentDeleteContent({
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
        get_content_item_by_id: wrapped({
            ...contentToolsConfig.get_content_item_by_id,
            execute: async ({ itemId, language }) => {
                return await wrapAgentCall(async () => client.agent.contentGetContentItemById({
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
        update_content: wrapped({
            ...contentToolsConfig.update_content,
            execute: async ({ itemId, fields, language, createNewVersion, siteName }) => {
                return await callWithJobId(async (jobId) => client.agent.contentUpdateContent({
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
        get_content_item_by_path: wrapped({
            ...contentToolsConfig.get_content_item_by_path,
            execute: async ({ item_path, failOnNotFound, language }) => {
                return await wrapAgentCall(async () => client.agent.contentGetContentItemByPath({
                    query: {
                        item_path,
                        failOnNotFound,
                        language,
                        sitecoreContextId,
                    }
                }));
            }
        }),
        list_available_insert_options: wrapped({
            ...contentToolsConfig.list_available_insert_options,
            execute: async ({ itemId, language }) => {
                return await wrapAgentCall(async () => client.agent.contentListAvailableInsertoptions({
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

export function componentsTools(client: experimental_XMC, sitecoreContextId: string, config?: ToolConfig) {
    const wrapped = wrapTool(config ?? {});
    return {
        create_component_datasource: wrapped({
            ...componentsToolsConfig.create_component_datasource,
            execute: async ({ componentId, siteName, dataFields, children, language }) => {
                return await callWithJobId(async (jobId) => client.agent.componentsCreateComponentDatasource({
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
        search_component_datasources: wrapped({
            ...componentsToolsConfig.search_component_datasources,
            execute: async ({ componentId, term }) => {
                return await wrapAgentCall(async () => client.agent.componentsSearchComponentDatasources({
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
        list_components: wrapped({
            ...componentsToolsConfig.list_components,
            execute: async ({ site_name }) => {
                return await wrapAgentCall(async () => client.agent.componentsListComponents({
                    query: {
                        site_name,
                        sitecoreContextId,
                    }
                }));
            }
        }),
        get_component: wrapped({
            ...componentsToolsConfig.get_component,
            execute: async ({ componentId }) => {
                return await wrapAgentCall(async () => client.agent.componentsGetComponent({
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
