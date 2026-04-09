---
name: create-page
description: Step-by-step guide for creating a new page in a SitecoreAI site — determining the parent, checking insert options, inspecting the template, and creating the page.
---

# Create Page

Follow this workflow when creating a new page in a SitecoreAI site.

## Step-by-Step Flow

### 1. Determine the parent page
- If the user specified where to create the page, use that location
- If you have the current page context (e.g. inside Page Builder), use `get_current_page_context` to get the current page — it may serve as the parent or help narrow down the location
- If no context is available, use `get_sites_list` and `get_all_pages_by_site` to browse the page tree and identify the right parent
- Ask the user if the parent page is still ambiguous

### 2. Check insert options
- Use `list_available_insert_options` with the parent page's item ID and language
- This returns the list of page templates allowed under that parent
- If only one template is available, use it. If multiple, let the user pick or choose the most appropriate one based on context

### 3. Inspect the template
- Use `get_page_template_by_id` to inspect the chosen template's field definitions
- Note the field names, types (text, rich text, image, etc.), and which are required

### 4. Create the page
- Call `create_page` with:
  - `templateId` — the template ID from step 2/3
  - `name` — the page name (URL-friendly slug)
  - `parentId` — the parent page's item ID from step 1
  - `language` — the language from the current context or the user's preference
  - `fields` — populate template fields with values from the user's request or sensible defaults
- This is a SINGLE atomic operation — all parameters must be provided in one call

### 5. Navigate to the new page
- Use `navigate_to_another_page` with the new page's item ID to open it in the editor
- Confirm to the user that the page was created and opened

## Rules
- ALWAYS check insert options before creating — never guess the template
- NEVER call `create_page` with empty `fields` if the template has field definitions — populate them with actual values
- Page names should be URL-friendly (lowercase, hyphens instead of spaces) unless the user specifies otherwise
- If `search_site` would help find an existing page (e.g. to avoid duplicates or to locate the right parent), use it
- Write content as a professional copywriter — NEVER include meta-commentary about your process
