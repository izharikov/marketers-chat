import { z } from 'zod';

export const assetToolsConfig = {
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

export const environmentToolsConfig = {
    list_languages: {
        description: 'Retrieves all languages available.',
        inputSchema: z.object({}),
    }
}

export const personalizationToolsConfig = {
    create_personalization_version: {
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
    },
    get_personalization_versions_by_page: {
        description: 'Retrieves all personalization versions configured for a specific page, including their targeting rules and content variations.',
        inputSchema: z.object({
            pageId: z.string().describe('The unique identifier of the page.'),
        }),
    },
    get_condition_templates: {
        description: 'Retrieves all available condition templates for personalization.',
        inputSchema: z.object({}),
    },
    get_condition_template_by_id: {
        description: 'Returns a condition template by ID and its parameters for creating a personalization variant on a page.',
        inputSchema: z.object({
            templateId: z.string().describe('The unique identifier of the condition template.'),
        }),
    }
}


export const jobToolsConfig = {
    revert_job: {
        description: 'Reverts the operations of the specified job.',
        inputSchema: z.object({
            jobId: z.string().describe('The unique identifier of the job to be reverted.'),
        }),
    },
    get_job: {
        description: 'Retrieves the details of the specified job.',
        inputSchema: z.object({
            jobId: z.string().describe('The unique identifier of the job.'),
        }),
    },
    list_operations: {
        description: 'Retrieves the operations associated with the specified job.',
        inputSchema: z.object({
            jobId: z.string().describe('The unique identifier of the job.'),
        }),
    }
}

export const pagesToolsConfig = {
    get_page: {
        description: 'Retrieves comprehensive information about a page including its layout, components, placeholders, and available actions.',
        inputSchema: z.object({
            pageId: z.string().describe('The unique identifier of the page.'),
            language: z.string().describe('The language of the page.'),
        }),
    },
    create_page: {
        description: 'Creates a new page in the specified location with the given template, fields, and language.',
        inputSchema: z.object({
            templateId: z.string().describe('The ID of the template to use for the new page.'),
            name: z.string().describe('The name of the new page.'),
            parentId: z.string().describe('The ID of the parent page.'),
            language: z.string().describe('The language of the new page.'),
            fields: z.array(z.record(z.string(), z.unknown())).describe('The fields for the new page.'),
        }),
    },
    get_page_template_by_id: {
        description: 'Retrieves detailed information about a specific page template, including its fields and settings.',
        inputSchema: z.object({
            templateId: z.string().describe('The unique identifier of the page template.'),
        }),
    },
    get_allowed_components_by_placeholder: {
        description: 'Retrieves a list of components that are allowed to be added to a specific placeholder on a page.',
        inputSchema: z.object({
            pageId: z.string().describe('The unique identifier of the page.'),
            placeholderName: z.string().describe('The name of the placeholder.'),
            language: z.string().describe('The language of the page.'),
        }),
    },
    get_components_on_page: {
        description: 'Retrieves a list of components that are currently added to a specific page.',
        inputSchema: z.object({
            pageId: z.string().describe('The unique identifier of the page.'),
            language: z.string().describe('The language of the page.'),
            version: z.number().describe('The version of the page.'),
        }),
    },
    add_component_on_page: {
        description: 'Adds a component to a specific placeholder on a page.',
        inputSchema: z.object({
            pageId: z.string().describe('The unique identifier of the page.'),
            componentRenderingId: z.string().describe('The rendering ID of the component.'),
            placeholderPath: z.string().describe('The path of the placeholder.'),
            componentItemName: z.string().describe('The item name of the component.'),
            language: z.string().describe('The language of the page.'),
            fields: z.record(z.string(), z.unknown()).describe('The fields for the component.'),
        }),
    },
    set_component_datasource: {
        description: 'Sets the datasource for a component on a page.',
        inputSchema: z.object({
            pageId: z.string().describe('The unique identifier of the page.'),
            componentId: z.string().describe('The unique identifier of the component.'),
            datasourceId: z.string().describe('The unique identifier of the datasource.'),
            language: z.string().describe('The language of the page.'),
        }),
    },
    add_language_to_page: {
        description: 'Creates a language version of an existing page.',
        inputSchema: z.object({
            pageId: z.string().describe('The unique identifier of the page.'),
            language: z.string().describe('The language to add.'),
        }),
    },
    search_site: {
        description: 'Searches all pages in a specific site by title or content.',
        inputSchema: z.object({
            search_query: z.string().describe('The search query.'),
            site_name: z.string().describe('The name of the site to search.'),
            language: z.string().describe('The language to search in.'),
        }),
    },
    get_page_path_by_live_url: {
        description: 'Get the page item path corresponding to a live URL.',
        inputSchema: z.object({
            live_url: z.string().describe('The live URL of the page.'),
        }),
    },
    get_page_screenshot: {
        description: 'Captures and returns a screenshot of the specified page.',
        inputSchema: z.object({
            pageId: z.string().describe('The unique identifier of the page.'),
            version: z.number().describe('The version of the page.'),
            language: z.string().describe('The language of the page.'),
            width: z.number().describe('The width of the screenshot.'),
            height: z.number().describe('The height of the screenshot.'),
        }),
    },
    get_page_html: {
        description: 'Retrieves the HTML content of a specific page.',
        inputSchema: z.object({
            pageId: z.string().describe('The unique identifier of the page.'),
            language: z.string().describe('The language of the page.'),
            version: z.number().describe('The version of the page.'),
        }),
    },
    get_page_preview_url: {
        description: 'Retrieves the preview URL of a specific page.',
        inputSchema: z.object({
            pageId: z.string().describe('The unique identifier of the page.'),
            language: z.string().describe('The language of the page.'),
            version: z.number().describe('The version of the page.'),
        }),
    }
}

export const sitesToolsConfig = {
    get_sites_list: {
        description: 'Retrieves a list of all available sites with their basic information and configuration.',
        inputSchema: z.object({}),
    },
    get_site_details: {
        description: 'Retrieves detailed information about a specific site including its configuration, themes, and available languages.',
        inputSchema: z.object({
            siteId: z.string().describe('The unique identifier of the site.'),
        }),
    },
    get_all_pages_by_site: {
        description: 'Returns a flat list of routes for the specified site and language, each with id and path.',
        inputSchema: z.object({
            siteName: z.string().describe('The name of the site.'),
            language: z.string().describe('The language of the pages.'),
        }),
    },
    get_site_id_from_item: {
        description: 'Returns the site root item ID for a given item by traversing ancestors to find the site root template.',
        inputSchema: z.object({
            itemId: z.string().describe('The unique identifier of the item.'),
        }),
    }
}

export const contentToolsConfig = {
    create_content_item: {
        description: 'Creates a new content item with the specified template, fields, and location.',
        inputSchema: z.object({
            templateId: z.string().describe('The ID of the template for the content item.'),
            name: z.string().describe('The name of the content item.'),
            parentId: z.string().describe('The ID of the parent item.'),
            language: z.string().describe('The language of the content item.'),
            fields: z.record(z.string(), z.unknown()).describe('The fields for the content item.'),
        }),
    },
    delete_content: {
        description: 'Deletes a content item and optionally all its child items.',
        inputSchema: z.object({
            itemId: z.string().describe('The unique identifier of the item to delete.'),
            language: z.string().describe('The language of the item.'),
        }),
    },
    get_content_item_by_id: {
        description: 'Retrieves detailed information about a specific content item using its unique identifier.',
        inputSchema: z.object({
            itemId: z.string().describe('The unique identifier of the item.'),
            language: z.string().describe('The language of the item.'),
        }),
    },
    update_content: {
        description: 'Updates comprehensive information about a content item including its fields and metadata.',
        inputSchema: z.object({
            itemId: z.string().describe('The unique identifier of the item to update.'),
            fields: z.record(z.string(), z.unknown()).describe('The fields to update.'),
            language: z.string().describe('The language of the item.'),
            createNewVersion: z.boolean().describe('Whether to create a new version.'),
            siteName: z.string().describe('The name of the site.'),
        }),
    },
    get_content_item_by_path: {
        description: 'Retrieves detailed information about a content item using its path in the content tree.',
        inputSchema: z.object({
            item_path: z.string().describe('The path of the content item.'),
            failOnNotFound: z.boolean().describe('Whether to fail if the item is not found.'),
            language: z.string().describe('The language of the item.'),
        }),
    },
    list_available_insert_options: {
        description: 'Retrieves the available content templates that can be inserted as child items under the specified parent item.',
        inputSchema: z.object({
            itemId: z.string().describe('The unique identifier of the item.'),
            language: z.string().describe('The language of the item.'),
        }),
    }
}


export const componentsToolsConfig = {
    create_component_datasource: {
        description: 'Creates a new datasource item for a specific component with the provided field values.',
        inputSchema: z.object({
            componentId: z.string().describe('The unique identifier of the component.'),
            siteName: z.string().describe('The name of the site.'),
            dataFields: z.record(z.string(), z.unknown()).describe('The fields for the datasource.'),
            children: z.array(z.record(z.string(), z.unknown())).describe('The children of the datasource.'),
            language: z.string().describe('The language of the datasource.'),
        }),
    },
    search_component_datasources: {
        description: 'Searches for available datasources that can be used with a specific component.',
        inputSchema: z.object({
            componentId: z.string().describe('The unique identifier of the component.'),
            term: z.string().describe('The search term.'),
        }),
    },
    list_components: {
        description: 'Retrieves a list of all available components for a specific site.',
        inputSchema: z.object({
            site_name: z.string().describe('The name of the site.'),
        }),
    },
    get_component: {
        description: 'Retrieves detailed information about a specific component including its fields, datasource requirements, and configuration options.',
        inputSchema: z.object({
            componentId: z.string().describe('The unique identifier of the component.'),
        }),
    }
}

