---
name: manage-personalization
description: Workflow for creating and managing personalization versions, targeting rules, and conditions on Sitecore XM Cloud pages.
---

# Manage Personalization

Follow this workflow when creating or managing personalization on a page.

## Workflows

### View existing personalization
1. Use `get_personalization_versions_by_page` to see all personalization versions configured for the page

### Create a new personalization version
1. Use `get_condition_templates` to see available condition types
2. Use `get_condition_template_by_id` to inspect a specific condition template and its parameters
3. Use `create_personalization_version` with:
   - The target `pageId`
   - A name for the personalization version
   - A variant name
   - An audience name
   - The condition template ID and its parameters
