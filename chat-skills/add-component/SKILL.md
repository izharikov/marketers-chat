---
name: add-component
description: Step-by-step guide for adding a component to a Sitecore XM Cloud page — discovering placeholders, selecting components, populating fields, and verifying the result.
---

# Add Component to Page

Follow this workflow when adding a component to a Sitecore XM Cloud page.

## Step-by-Step Flow

### 1. Identify the target placeholder
- Use `get_current_page_context` to understand the current page
- Use `get_components_on_page` to see existing layout and available placeholders
- If the user didn't specify a placeholder, pick the most appropriate one based on context

### 2. Check allowed components
- Use `get_allowed_components_by_placeholder` for the target placeholder
- Present the available components to the user if they haven't specified which one to add

### 3. Inspect the component
- Use `get_component` to retrieve the component's datasource fields
- Understand which fields are required and what values they expect (text, rich text, image, link, etc.)

### 4. Add the component
- Call `add_component_on_page` with ALL datasource fields populated in a single call
- NEVER call `add_component_on_page` with empty or missing fields — this is a single atomic operation

### 5. Verify
- Call `reload_current_page` to refresh the page and confirm the component was added

## Rules
- Adding a component MUST be a single atomic action — placement and content in one call
- If field values are known (e.g. from search results or user input), always populate them. If unknown, ask the user or generate reasonable defaults
- Use `update_content` ONLY for components that already existed on the page, never for newly added ones
- Write content as a professional copywriter — NEVER include phrases like "Based on what I found", "According to my search", or any reference to your own process/tools. The content must read as if a human author wrote it.
