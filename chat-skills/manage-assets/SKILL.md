---
name: manage-assets
description: Workflow for managing Media Library assets in Sitecore XM Cloud — searching, inspecting, updating metadata, and uploading new files.
---

# Manage Assets

Follow this workflow when working with assets in the Sitecore Media Library.

## Important

Asset tools are ONLY for Media Library items (images, videos, documents, PDFs).
For page content or component fields, use page layout tools instead.

## Workflows

### Find an asset
1. Use `search_assets` with a keyword to find assets in the Media Library
2. Use `get_asset_information` to inspect a specific asset's details (title, alt text, dimensions, etc.)

### Update asset metadata
1. Use `get_asset_information` to get current metadata
2. Use `update_asset` to update fields like title, description, or alt text

### Upload a new asset
1. Use `upload_asset` to upload a new media file to the Media Library
2. Confirm the upload was successful by checking the returned asset information
