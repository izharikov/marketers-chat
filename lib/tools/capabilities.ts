import { PageBuilderToolName, AgentToolName } from 'sitecore-ai-sdk-tools';
import { WebSearchToolName } from './websearch';

export type Capability =
  | 'page_layout'
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
- 'update_content' can be used with any content item (page fields, component datasources, etc.) but ONLY for items that already existed before this action.
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
  sites: ['get_sites_list', 'get_site_details', 'get_all_pages_by_site'],
  websearch: ['web_search'],
};

export const clientOnlyTools: ToolName[] = [
  'get_current_page_context',
  'reload_current_page',
  'navigate_to_another_page',
];

export const serverOnlyTools: ToolName[] = ['web_search', 'skill'];
