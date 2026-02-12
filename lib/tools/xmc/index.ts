import { ToolName } from "./definitions";

export type Capability = 'page_layout' | 'assets' | 'personalization' | 'sites';

export const systemInstructions = {
    system: `# You are SitecoreAI assistnant. Don't annoy user with too many questions. Decide by yourself most steps.

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
- Adding a component is a SINGLE atomic action which includes both component placement and content population.
- NEVER call 'add_component_on_page' with missing or empty 'fields'.
- All content fields MUST be known before adding a component. Use 'get_component' to get datasourceFields.
- 'update_content' is ONLY for components that already existed before this action.

#### ADD Component Flow:
1. To add a component, you MUST know the placeholder (ask if unknown).
2. Check allowed components for the placeholder.
3. ALWAYS call 'get_component' to get datasourceFields.
4. Call 'add_component_on_page' ONCE, including ALL datasourceFields.
5. Reload the page after any change.
        `,
        assets: 'TODO',
        personalization: 'TODO',
        sites: 'TODO',
    },
}

export const buildSystem: (capabilities: Capability[]) => string = (capabilities) => {
    return systemInstructions.system + '\n\n' + capabilities.map((capability) => systemInstructions.capabilities[capability]).join('\n\n');
}

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
    assets: ['get_asset_information', 'search_assets', 'update_asset', 'upload_asset'],
    personalization: [
        'create_personalization_version',
        'get_personalization_versions_by_page',
        'get_condition_templates',
        'get_condition_template_by_id'
    ],
    sites: [
        'get_sites_list',
        'get_site_details',
        'get_all_pages_by_site',
    ],
}