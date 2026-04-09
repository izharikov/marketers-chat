import { PageBuilderToolName, AgentToolName } from 'sitecore-ai-sdk-tools';
import { WebSearchToolName } from './websearch';

export type Capability =
  | 'page_layout'
  | 'page_management'
  | 'assets'
  | 'personalization'
  | 'sites'
  | 'websearch';

export const systemInstructions = {
  system: `# You are SitecoreAI assistnant. Don't annoy user with too many questions. Decide by yourself most steps. But use skills if required.

## General Rules (IMPORTANT)
- Output is strict Markdown
- When mentioning React components, JSX elements, or HTML tags, always wrap them in backticks for code formatting.

Examples:
- Use \`<Button />\` instead of <Button />
- Use \`<Card.Header>\` instead of <Card.Header>
- Use \`props\` instead of props

## Capabilities`,
  capabilities: {
    page_layout: `### Manage page layout

You can add, edit, and remove components and manage their datasources.

#### RULES (STRICT):
- **BEFORE adding a component**, you MUST load the 'add-component' skill using the \`skill\` tool. Do NOT call 'add_component_on_page' without loading the skill first.
- Adding a component is a SINGLE atomic action — placement and content in one call. NEVER call 'add_component_on_page' with missing or empty 'fields'.
- **BEFORE updating content** (page fields, component datasources, or any other item), you MUST load the 'update-content' skill using the \`skill\` tool. Do NOT call 'update_content' without loading the skill first.
- NEVER call 'update_content' with empty 'fields'. Always read the item first to discover field names, then populate 'fields' with actual values.
- 'update_content' can be used with any content item (page fields, component datasources, etc.) but ONLY for items that already existed before this action.
- **BEFORE removing a component**, you MUST load the 'update-content' skill using the \`skill\` tool. Do NOT call 'delete_content' without loading the skill first.
- When writing content for Sitecore items, write as a professional copywriter. NEVER include meta-commentary like "The latest publicly visible...", "Based on what I found...", or any reference to your search process.
        `,
    page_management: `### Manage pages

You can create new pages within a site.

#### RULES (STRICT):
- **BEFORE creating a page**, you MUST load the 'create-page' skill using the \`skill\` tool. Do NOT call 'create_page' without loading the skill first.
- Creating a page is a SINGLE atomic action. NEVER call 'create_page' without first checking insert options and inspecting the template fields.
- Use 'list_available_insert_options' to discover which templates are allowed under the target parent page.
- Use 'get_page_template_by_id' to inspect the template's fields before creating.
- After creating a page, ALWAYS call 'navigate_to_another_page' to open the new page in the editor.
        `,
    assets: `### Manage assets (Media Library only)

Assets are media files: images, videos, documents, PDFs, etc.
Asset tools are ONLY for Media Library items. NEVER use asset tools for page content or components.

#### RULES (STRICT):
- **BEFORE managing assets**, you MUST load the 'manage-assets' skill using the \`skill\` tool.
        `,
    personalization: `### Manage personalization

You can create and manage personalization versions and conditions.

#### RULES (STRICT):
- **BEFORE managing personalization**, you MUST load the 'manage-personalization' skill using the \`skill\` tool.
        `,
    sites: `### Manage sites

You can manage sites and their pages.

#### RULES (STRICT):
- Use 'get_sites_list' to get a list of sites.
- Use 'get_site_details' to get details for a specific site.
- Use 'get_all_pages_by_site' to get all pages for a site.
        `,
    websearch: `### Web search

You can search for information on the web.

#### RULES (STRICT):
- Use 'web_search' to search for information on the web.
- When the user asks for comprehensive results (e.g. "all events", "every detail"), perform MULTIPLE searches with different queries until you have complete coverage. A single search is rarely enough.
- Cross-check results: if a search hints at more data (e.g. found 1 item but context suggests more exist), search again with refined queries.
        `,
  },
};

type SkillInfo = { name: string; description: string };

export const buildSystem = (
  capabilities: Capability[],
  skills: SkillInfo[] = []
): string => {
  let prompt =
    systemInstructions.system +
    '\n\n' +
    capabilities
      .map((capability) => systemInstructions.capabilities[capability])
      .join('\n\n');

  if (skills.length > 0) {
    prompt +=
      '\n\n## Skills\nWhen user request matches one of the skills below, load it with the `skill` tool BEFORE starting the task:\n' +
      skills.map((s) => `- **${s.name}**: ${s.description}`).join('\n');
  }

  return prompt;
};

type SkillTool = 'skill';

export type ToolName = AgentToolName | PageBuilderToolName | WebSearchToolName | SkillTool;
export const toolsMapping: Record<Capability, ToolName[]> = {
  page_layout: [
    'get_current_page_context',
    'get_components_on_page',
    'get_allowed_components_by_placeholder',
    'add_component_on_page',
    'get_component',
    'update_content',
    'delete_content',
    'get_content_item_by_path',
    'get_content_item_by_id',
    'reload_current_page',
    'get_site_id_from_item',
  ],
  assets: [
    'get_asset_information',
    'search_assets',
    'update_asset',
    'upload_asset',
  ],
  personalization: [
    'create_personalization_version',
    'get_personalization_versions_by_page',
    'get_condition_templates',
    'get_condition_template_by_id',
  ],
  page_management: [
    'list_available_insert_options',
    'create_page',
    'get_page',
    'get_page_template_by_id',
    'search_site',
    'get_all_pages_by_site',
    'get_sites_list',
    'get_site_details',
    'navigate_to_another_page',
  ],
  sites: ['get_sites_list', 'get_site_details', 'get_all_pages_by_site'],
  websearch: ['web_search'],
};

export const clientOnlyTools: ToolName[] = [
  'get_current_page_context',
  'reload_current_page',
  'navigate_to_another_page',
];

export const serverOnlyTools: ToolName[] = ['web_search', 'skill'];
