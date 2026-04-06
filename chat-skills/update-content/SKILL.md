---
name: update-content
description: Step-by-step guide for updating any content item — reading current fields, composing new values, and calling update_content correctly.
---

# Update Content Item

Follow this workflow when updating any SitecoreAI content item (page, component datasource, or any other item).

## Step-by-Step Flow

### 1. Read the current item
- If the item ID is already known (e.g. a component datasource), skip to the next bullet
- Otherwise, use `get_current_page_context` to get the current page's item ID, language, and site name. Note: this tool does NOT return field values.
- Use `get_content_item_by_id` or `get_content_item_by_path` to read the item's **actual field names and values**
- If updating a component datasource, use `get_component` to read its fields

### 2. Identify target fields
- From the response, note the exact field names (e.g. `Title`, `Content`, `Description`)
- Field names are **case-sensitive** — use them exactly as returned

### 3. Compose field values
- Build the new value for each field you need to update
- For rich text fields, use valid HTML
- If the user asked you to search the web first, incorporate the search results into the field values NOW — do not defer this to a later step

### 4. Self-check before calling `update_content`
Before making the tool call, verify:
- [ ] You have at least one field name from step 2
- [ ] You have composed a non-empty value for each field in step 3
- [ ] The `fields` object you are about to send is NOT `{}`

If any check fails — STOP. Go back to the missing step. Do NOT call `update_content` with empty `fields`.

### 5. Call `update_content`
- The `fields` parameter MUST contain the field names from step 2, with the values you composed in step 3
- Example:
  ```json
  {
    "itemId": "<item-id>",
    "fields": {
      "<Field Name>": "<h2>Title</h2><p>Body text here</p>"
    },
    "language": "en",
    "createNewVersion": true,
    "siteName": "PLAY"
  }
  ```

### 6. Verify
- Call `reload_current_page` to refresh and confirm the update

## Rules
- ALWAYS read the item first to discover field names — never guess field names
- NEVER pass empty `fields: {}` — if you have nothing to write, stop and tell the user
- When combining web search results with content update, finish composing the HTML/text BEFORE calling `update_content`
- If multiple fields need updating, include them all in a single `update_content` call
- Write content as a professional copywriter — NEVER include phrases like "Based on what I found", "According to my search", or any reference to your own process/tools. The content must read as if a human author wrote it.
