import { tool } from "ai";
import { assetToolsConfig, componentsToolsConfig, contentToolsConfig, pagesToolsConfig, sitesToolsConfig, jobToolsConfig, environmentToolsConfig, personalizationToolsConfig } from "../definitions";

export function assetTools() {
    return {
        get_asset_information: tool(assetToolsConfig.get_asset_information),
        search_assets: tool(assetToolsConfig.search_assets),
        update_asset: tool(assetToolsConfig.update_asset),
        upload_asset: tool(assetToolsConfig.upload_asset),
    };
}

export function environmentTools() {
    return {
        list_languages: tool(environmentToolsConfig.list_languages)
    }
}

export function personalizationTools() {
    return {
        create_personalization_version: tool(personalizationToolsConfig.create_personalization_version),
        get_personalization_versions_by_page: tool(personalizationToolsConfig.get_personalization_versions_by_page),
        get_condition_templates: tool(personalizationToolsConfig.get_condition_templates),
        get_condition_template_by_id: tool(personalizationToolsConfig.get_condition_template_by_id),
    }
}

export function jobTools() {
    return {
        revert_job: tool(jobToolsConfig.revert_job),
        get_job: tool(jobToolsConfig.get_job),
        list_operations: tool(jobToolsConfig.list_operations),
    }
}

export function pagesTools() {
    return {
        get_page: tool(pagesToolsConfig.get_page),
        create_page: tool(pagesToolsConfig.create_page),
        get_page_template_by_id: tool(pagesToolsConfig.get_page_template_by_id),
        get_allowed_components_by_placeholder: tool(pagesToolsConfig.get_allowed_components_by_placeholder),
        get_components_on_page: tool(pagesToolsConfig.get_components_on_page),
        add_component_on_page: tool(pagesToolsConfig.add_component_on_page),
        set_component_datasource: tool(pagesToolsConfig.set_component_datasource),
        add_language_to_page: tool(pagesToolsConfig.add_language_to_page),
        search_site: tool(pagesToolsConfig.search_site),
        get_page_path_by_live_url: tool(pagesToolsConfig.get_page_path_by_live_url),
        get_page_screenshot: tool(pagesToolsConfig.get_page_screenshot),
        get_page_html: tool(pagesToolsConfig.get_page_html),
        get_page_preview_url: tool(pagesToolsConfig.get_page_preview_url),
    }
}

export function sitesTools() {
    return {
        get_sites_list: tool(sitesToolsConfig.get_sites_list),
        get_site_details: tool(sitesToolsConfig.get_site_details),
        get_all_pages_by_site: tool(sitesToolsConfig.get_all_pages_by_site),
        get_site_id_from_item: tool(sitesToolsConfig.get_site_id_from_item),
    }
}

export function contentTools() {
    return {
        create_content_item: tool(contentToolsConfig.create_content_item),
        delete_content: tool(contentToolsConfig.delete_content),
        get_content_item_by_id: tool(contentToolsConfig.get_content_item_by_id),
        update_content: tool(contentToolsConfig.update_content),
        get_content_item_by_path: tool(contentToolsConfig.get_content_item_by_path),
        list_available_insert_options: tool(contentToolsConfig.list_available_insert_options),
    }
}

export function componentsTools() {
    return {
        create_component_datasource: tool(componentsToolsConfig.create_component_datasource),
        search_component_datasources: tool(componentsToolsConfig.search_component_datasources),
        list_components: tool(componentsToolsConfig.list_components),
        get_component: tool(componentsToolsConfig.get_component),
    }
}

export { runClientTool } from './execution';