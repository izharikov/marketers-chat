import { Tool, tool } from "ai";
import { assetToolsConfig, componentsToolsConfig, contentToolsConfig, pagesToolsConfig, sitesToolsConfig, jobToolsConfig, environmentToolsConfig, personalizationToolsConfig } from "../definitions";

export type ToolDefinitionConfig = {
    needsApproval?: boolean;
}

function wrapTool(commonConfig: ToolDefinitionConfig) {
    return function <INPUT>(params: Tool<INPUT, never>) {
        return tool({
            ...params,
            ...commonConfig,
        });
    };
}

export function assetTools(commonConfig?: ToolDefinitionConfig) {
    const wrapped = wrapTool(commonConfig ?? {});
    return {
        get_asset_information: wrapped(assetToolsConfig.get_asset_information),
        search_assets: wrapped(assetToolsConfig.search_assets),
        update_asset: wrapped(assetToolsConfig.update_asset),
        upload_asset: wrapped(assetToolsConfig.upload_asset),
    };
}

export function environmentTools(commonConfig?: ToolDefinitionConfig) {
    const wrapped = wrapTool(commonConfig ?? {});
    return {
        list_languages: wrapped(environmentToolsConfig.list_languages)
    }
}

export function personalizationTools(commonConfig?: ToolDefinitionConfig) {
    const wrapped = wrapTool(commonConfig ?? {});
    return {
        create_personalization_version: wrapped(personalizationToolsConfig.create_personalization_version),
        get_personalization_versions_by_page: wrapped(personalizationToolsConfig.get_personalization_versions_by_page),
        get_condition_templates: wrapped(personalizationToolsConfig.get_condition_templates),
        get_condition_template_by_id: wrapped(personalizationToolsConfig.get_condition_template_by_id),
    }
}

export function jobTools(commonConfig?: ToolDefinitionConfig) {
    const wrapped = wrapTool(commonConfig ?? {});
    return {
        revert_job: wrapped(jobToolsConfig.revert_job),
        get_job: wrapped(jobToolsConfig.get_job),
        list_operations: wrapped(jobToolsConfig.list_operations),
    }
}

export function pagesTools(commonConfig?: ToolDefinitionConfig) {
    const wrapped = wrapTool(commonConfig ?? {});
    return {
        get_page: wrapped(pagesToolsConfig.get_page),
        create_page: wrapped(pagesToolsConfig.create_page),
        get_page_template_by_id: wrapped(pagesToolsConfig.get_page_template_by_id),
        get_allowed_components_by_placeholder: wrapped(pagesToolsConfig.get_allowed_components_by_placeholder),
        get_components_on_page: wrapped(pagesToolsConfig.get_components_on_page),
        add_component_on_page: wrapped(pagesToolsConfig.add_component_on_page),
        set_component_datasource: wrapped(pagesToolsConfig.set_component_datasource),
        add_language_to_page: wrapped(pagesToolsConfig.add_language_to_page),
        search_site: wrapped(pagesToolsConfig.search_site),
        get_page_path_by_live_url: wrapped(pagesToolsConfig.get_page_path_by_live_url),
        get_page_screenshot: wrapped(pagesToolsConfig.get_page_screenshot),
        get_page_html: wrapped(pagesToolsConfig.get_page_html),
        get_page_preview_url: wrapped(pagesToolsConfig.get_page_preview_url),
    }
}

export function sitesTools(commonConfig?: ToolDefinitionConfig) {
    const wrapped = wrapTool(commonConfig ?? {});
    return {
        get_sites_list: wrapped(sitesToolsConfig.get_sites_list),
        get_site_details: wrapped(sitesToolsConfig.get_site_details),
        get_all_pages_by_site: wrapped(sitesToolsConfig.get_all_pages_by_site),
        get_site_id_from_item: wrapped(sitesToolsConfig.get_site_id_from_item),
    }
}

export function contentTools(commonConfig?: ToolDefinitionConfig) {
    const wrapped = wrapTool(commonConfig ?? {});
    return {
        create_content_item: wrapped(contentToolsConfig.create_content_item),
        delete_content: wrapped(contentToolsConfig.delete_content),
        get_content_item_by_id: wrapped(contentToolsConfig.get_content_item_by_id),
        update_content: wrapped(contentToolsConfig.update_content),
        get_content_item_by_path: wrapped(contentToolsConfig.get_content_item_by_path),
        list_available_insert_options: wrapped(contentToolsConfig.list_available_insert_options),
    }
}

export function componentsTools(commonConfig?: ToolDefinitionConfig) {
    const wrapped = wrapTool(commonConfig ?? {});
    return {
        create_component_datasource: wrapped(componentsToolsConfig.create_component_datasource),
        search_component_datasources: wrapped(componentsToolsConfig.search_component_datasources),
        list_components: wrapped(componentsToolsConfig.list_components),
        get_component: wrapped(componentsToolsConfig.get_component),
    }
}

export { runClientTool } from './execution';