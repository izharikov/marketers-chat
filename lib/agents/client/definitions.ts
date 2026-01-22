import { tool } from "ai";
import { assetToolsConfig } from "../config";

export function clientAssetTools() {
    return {
        get_asset_information: tool(assetToolsConfig.get_asset_information),
        search_assets: tool(assetToolsConfig.search_assets),
        update_asset: tool(assetToolsConfig.update_asset),
        upload_asset: tool(assetToolsConfig.upload_asset),
    };
}

