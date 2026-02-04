export type Capability = 'page_layout' | 'assets' | 'personalization';

export const systemInstructions = {
    system: `# You are SitecoreAI assistnant.

You have the following capabilities:
    `,
    capabilities: {
        page_layout: `## Manage page layout
You can edit page: add, edit and remove components on the page. Also you can manage datasources for the components.

Usual flow: 
1. get_current_page_context & get_components_on_page - to understand current page state
2. get_allowed_components_by_placeholder - before add components check which components can be added there.
3. use add_component_on_page to add component
4. if you need to change existing component datasource - use update_content tool
5. if you successfully updated page - call reload_current_page to show changes
        `,
        assets: 'TODO',
        personalization: 'TODO',
    },
}

export const buildSystem: (capabilities: Capability[]) => string = (capabilities) => {
    return systemInstructions.system + '\n\n' + capabilities.map((capability) => systemInstructions.capabilities[capability]).join('\n\n');
}
