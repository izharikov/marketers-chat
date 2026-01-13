import { experimental_XMC } from "@sitecore-marketplace-sdk/xmc";
import { tool } from "ai";
import { z } from "zod/v4";
import { v4 as uuidv4 } from 'uuid';

async function wrapAgentCall<TResult>(call: (jobId: string) => Promise<TResult>) {
    const jobId = uuidv4();
    const response = call(jobId);
    return { ...response, jobId };
};

const assetToolsConfig = {
    get_asset_information: {
        description: 'Retrieves detailed information about a specific digital asset including its metadata, file properties, and usage information.',
        inputSchema: z.object({
            assetId: z.string().describe('The unique identifier of the asset to be retrieved.'),
        }),
    },
    search_assets: {
        description: 'Searches for digital assets based on query terms, file types, or tags. Returns a list of matching assets with their metadata and download URLs.',
        inputSchema: z.object({
            query: z.string().describe('The search query to find assets matching the specified criteria.'),
            language: z.string().describe('The language of the assets to be retrieved.'),
            type: z.string().describe('The type of the assets to be retrieved.'),
        }),
    },
    update_asset: {
        description: 'Updates the metadata and properties of an existing digital asset. This allows you to modify asset information such as alt text, titles, and custom field values.',
        inputSchema: z.object({
            assetId: z.string().describe('The unique identifier of the asset to be updated.'),
            fields: z.object({
            }).describe('The metadata of the asset to be updated.'),
            language: z.string().describe('The language of the asset to be updated.'),
            name: z.string().describe('The name of the asset to be updated.'),
            altText: z.string().describe('The alt text of the asset to be updated.'),

        }),
    },
    upload_asset: {
        description: 'Uploads a new digital asset to the Sitecore Experience Cloud. This allows you to add new assets to your digital asset library.',
        inputSchema: z.object({
            fileUrl: z.string().describe('File url to upload'),
            name: z.string().describe('The name of the asset to be uploaded.'),
            itemPath: z.string().describe('The path of the asset to be uploaded.'),
            language: z.string().describe('The language of the asset to be uploaded.'),
            extension: z.string().describe('The extension of the asset to be uploaded.'),
            siteName: z.string().describe('The name of the site to which the asset will be uploaded.'),
        }),
    },
};

export function clientAssetTools() {
    return {
        get_asset_information: tool(assetToolsConfig.get_asset_information),
        search_assets: tool(assetToolsConfig.search_assets),
        update_asset: tool(assetToolsConfig.update_asset),
        upload_asset: tool(assetToolsConfig.upload_asset),
    };
}

export function assetTools(client: experimental_XMC, sitecoreContextId: string) {
    return {
        get_asset_information: tool({
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
        search_assets: tool({
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
        update_asset: tool({
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
        upload_asset: tool({
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
            description: 'Retrieves all languages available.',
            inputSchema: z.object({}),
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
            description: 'Creates a new personalization definition with one or more variants.',
            inputSchema: z.object({
                pageId: z.string().describe('The unique identifier of the page.'),
                name: z.string().describe('The name of the personalization version.'),
                variant_name: z.string().describe('The name of the variant.'),
                audience_name: z.string().describe('The name of the audience.'),
                condition_template_id: z.string().describe('The ID of the condition template.'),
                condition_params: z.object({}).describe('The parameters for the condition.'),
                language: z.string().describe('The language of the personalization version.'),
            }),
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
            description: 'Retrieves all personalization versions configured for a specific page, including their targeting rules and content variations.',
            inputSchema: z.object({
                pageId: z.string().describe('The unique identifier of the page.'),
            }),
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
            description: 'Retrieves all available condition templates for personalization.',
            inputSchema: z.object({}),
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
            description: 'Returns a condition template by ID and its parameters for creating a personalization variant on a page.',
            inputSchema: z.object({
                templateId: z.string().describe('The unique identifier of the condition template.'),
            }),
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
            description: 'Reverts the operations of the specified job.',
            inputSchema: z.object({
                jobId: z.string().describe('The unique identifier of the job to be reverted.'),
            }),
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
            description: 'Retrieves the details of the specified job.',
            inputSchema: z.object({
                jobId: z.string().describe('The unique identifier of the job.'),
            }),
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
            description: 'Retrieves the operations associated with the specified job.',
            inputSchema: z.object({
                jobId: z.string().describe('The unique identifier of the job.'),
            }),
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
            description: 'Retrieves comprehensive information about a page including its layout, components, placeholders, and available actions.',
            inputSchema: z.object({
                pageId: z.string().describe('The unique identifier of the page.'),
                language: z.string().describe('The language of the page.'),
            }),
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
            description: 'Creates a new page in the specified location with the given template, fields, and language.',
            inputSchema: z.object({
                templateId: z.string().describe('The ID of the template to use for the new page.'),
                name: z.string().describe('The name of the new page.'),
                parentId: z.string().describe('The ID of the parent page.'),
                language: z.string().describe('The language of the new page.'),
                fields: z.array(z.record(z.string(), z.unknown())).describe('The fields for the new page.'),
            }),
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
            description: 'Retrieves detailed information about a specific page template, including its fields and settings.',
            inputSchema: z.object({
                templateId: z.string().describe('The unique identifier of the page template.'),
            }),
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
            description: 'Retrieves a list of components that are allowed to be added to a specific placeholder on a page.',
            inputSchema: z.object({
                pageId: z.string().describe('The unique identifier of the page.'),
                placeholderName: z.string().describe('The name of the placeholder.'),
                language: z.string().describe('The language of the page.'),
            }),
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
            description: 'Retrieves a list of components that are currently added to a specific page.',
            inputSchema: z.object({
                pageId: z.string().describe('The unique identifier of the page.'),
                language: z.string().describe('The language of the page.'),
                version: z.number().describe('The version of the page.'),
            }),
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
            description: 'Adds a component to a specific placeholder on a page.',
            inputSchema: z.object({
                pageId: z.string().describe('The unique identifier of the page.'),
                componentRenderingId: z.string().describe('The rendering ID of the component.'),
                placeholderPath: z.string().describe('The path of the placeholder.'),
                componentItemName: z.string().describe('The item name of the component.'),
                language: z.string().describe('The language of the page.'),
                fields: z.record(z.string(), z.unknown()).describe('The fields for the component.'),
            }),
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
            description: 'Sets the datasource for a component on a page.',
            inputSchema: z.object({
                pageId: z.string().describe('The unique identifier of the page.'),
                componentId: z.string().describe('The unique identifier of the component.'),
                datasourceId: z.string().describe('The unique identifier of the datasource.'),
                language: z.string().describe('The language of the page.'),
            }),
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
            description: 'Creates a language version of an existing page.',
            inputSchema: z.object({
                pageId: z.string().describe('The unique identifier of the page.'),
                language: z.string().describe('The language to add.'),
            }),
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
            description: 'Searches all pages in a specific site by title or content.',
            inputSchema: z.object({
                search_query: z.string().describe('The search query.'),
                site_name: z.string().describe('The name of the site to search.'),
                language: z.string().describe('The language to search in.'),
            }),
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
            description: 'Get the page item path corresponding to a live URL.',
            inputSchema: z.object({
                live_url: z.string().describe('The live URL of the page.'),
            }),
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
            description: 'Captures and returns a screenshot of the specified page.',
            inputSchema: z.object({
                pageId: z.string().describe('The unique identifier of the page.'),
                version: z.number().describe('The version of the page.'),
                language: z.string().describe('The language of the page.'),
                width: z.number().describe('The width of the screenshot.'),
                height: z.number().describe('The height of the screenshot.'),
            }),
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
            description: 'Retrieves the HTML content of a specific page.',
            inputSchema: z.object({
                pageId: z.string().describe('The unique identifier of the page.'),
                language: z.string().describe('The language of the page.'),
                version: z.number().describe('The version of the page.'),
            }),
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
            description: 'Retrieves the preview URL of a specific page.',
            inputSchema: z.object({
                pageId: z.string().describe('The unique identifier of the page.'),
                language: z.string().describe('The language of the page.'),
                version: z.number().describe('The version of the page.'),
            }),
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

export function sitesTools(client: experimental_XMC, sitecoreContextId: string) {
    return {
        get_sites_list: tool({
            description: 'Retrieves a list of all available sites with their basic information and configuration.',
            inputSchema: z.object({}),
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
        get_site_details: tool({
            description: 'Retrieves detailed information about a specific site including its configuration, themes, and available languages.',
            inputSchema: z.object({
                siteId: z.string().describe('The unique identifier of the site.'),
            }),
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
        get_all_pages_by_site: tool({
            description: 'Returns a flat list of routes for the specified site and language, each with id and path.',
            inputSchema: z.object({
                siteName: z.string().describe('The name of the site.'),
                language: z.string().describe('The language of the pages.'),
            }),
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
        get_site_id_from_item: tool({
            description: 'Returns the site root item ID for a given item by traversing ancestors to find the site root template.',
            inputSchema: z.object({
                itemId: z.string().describe('The unique identifier of the item.'),
            }),
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
            description: 'Creates a new content item with the specified template, fields, and location.',
            inputSchema: z.object({
                templateId: z.string().describe('The ID of the template for the content item.'),
                name: z.string().describe('The name of the content item.'),
                parentId: z.string().describe('The ID of the parent item.'),
                language: z.string().describe('The language of the content item.'),
                fields: z.record(z.string(), z.unknown()).describe('The fields for the content item.'),
            }),
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
            description: 'Deletes a content item and optionally all its child items.',
            inputSchema: z.object({
                itemId: z.string().describe('The unique identifier of the item to delete.'),
                language: z.string().describe('The language of the item.'),
            }),
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
            description: 'Retrieves detailed information about a specific content item using its unique identifier.',
            inputSchema: z.object({
                itemId: z.string().describe('The unique identifier of the item.'),
                language: z.string().describe('The language of the item.'),
            }),
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
            description: 'Updates comprehensive information about a content item including its fields and metadata.',
            inputSchema: z.object({
                itemId: z.string().describe('The unique identifier of the item to update.'),
                fields: z.record(z.string(), z.unknown()).describe('The fields to update.'),
                language: z.string().describe('The language of the item.'),
                createNewVersion: z.boolean().describe('Whether to create a new version.'),
                siteName: z.string().describe('The name of the site.'),
            }),
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
            description: 'Retrieves detailed information about a content item using its path in the content tree.',
            inputSchema: z.object({
                item_path: z.string().describe('The path of the content item.'),
                failOnNotFound: z.boolean().describe('Whether to fail if the item is not found.'),
                language: z.string().describe('The language of the item.'),
            }),
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
            description: 'Retrieves the available content templates that can be inserted as child items under the specified parent item.',
            inputSchema: z.object({
                itemId: z.string().describe('The unique identifier of the item.'),
                language: z.string().describe('The language of the item.'),
            }),
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
            description: 'Creates a new datasource item for a specific component with the provided field values.',
            inputSchema: z.object({
                componentId: z.string().describe('The unique identifier of the component.'),
                siteName: z.string().describe('The name of the site.'),
                dataFields: z.record(z.string(), z.unknown()).describe('The fields for the datasource.'),
                children: z.array(z.record(z.string(), z.unknown())).describe('The children of the datasource.'),
                language: z.string().describe('The language of the datasource.'),
            }),
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
            description: 'Searches for available datasources that can be used with a specific component.',
            inputSchema: z.object({
                componentId: z.string().describe('The unique identifier of the component.'),
                term: z.string().describe('The search term.'),
            }),
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
            description: 'Retrieves a list of all available components for a specific site.',
            inputSchema: z.object({
                site_name: z.string().describe('The name of the site.'),
            }),
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
            description: 'Retrieves detailed information about a specific component including its fields, datasource requirements, and configuration options.',
            inputSchema: z.object({
                componentId: z.string().describe('The unique identifier of the component.'),
            }),
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
