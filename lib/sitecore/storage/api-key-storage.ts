import { ClientSDK } from "@sitecore-marketplace-sdk/client";

const config = {
  templateId: "{A6868D65-D612-401F-A40A-CD5BA0857B81}", // Template ID for API Key items
  root: "/sitecore/system/Settings/Services/API Keys", // Parent item path
  field: "AllowedControllers", // Field name where the key is stored
  rootId: '{59B41B5F-E22E-460B-941E-FB64FE8DA8FC}',
  language: 'en',
};

const queries = {
  getItem: `query GetItem($path: String!, $language: String!) {
    item(where: { path: $path, language: $language }) {
        itemId
        name
        fields(excludeStandardFields: true) {
            nodes {
                name
                value
            }
        }
    }
}`,
  updateItem: `mutation UpdateItem(
    $itemId: ID!
    $language: String!
    $fields: [FieldValueInput]!
) {
    updateItem(input: { itemId: $itemId, language: $language, fields: $fields }) {
        item {
            itemId
        }
    }
}
`,
  createItem: `mutation CreateItem(
    $name: String!
    $templateId: ID!
    $parent: ID!
    $language: String!
    $fields: [FieldValueInput!]!
) {
    createItem(
        input: {
            name: $name
            templateId: $templateId
            parent: $parent
            language: $language
            fields: $fields
        }
    ) {
        item {
            itemId
        }
    }
}`
}

/**
 * Fetches an API key from Sitecore using GraphQL
 */
export async function getApiKey(
  client: ClientSDK,
  sitecoreContextId: string,
  name: string
): Promise<string | null> {
  try {
    const itemPath = `${config.root}/${name}`;
    const result = await client.mutate('xmc.authoring.graphql', {
      params: {
        body: {
          query: queries.getItem,
          variables: {
            path: itemPath,
            language: config.language,
          },
        },
        query: {
          sitecoreContextId,
        }
      }
    });

    if (result?.data?.data) {
      const data = result.data?.data as any;
      if (data?.item?.fields) {
        const field = data.item.fields?.nodes?.find((f: any) => f.name === config.field);
        if (field?.value) {
          return field.value as string;
        }
      }
    }

    return null;
  } catch (error) {
    console.error("Error fetching API key:", error);
    return null;
  }
}

/**
 * Saves an API key to Sitecore using GraphQL
 */
export async function saveApiKey(
  client: ClientSDK,
  sitecoreContextId: string,
  name: string,
  key: string
): Promise<boolean> {
  try {
    const itemPath = `${config.root}/${name}`;
    const checkResult = await client.mutate("xmc.authoring.graphql", {
      params: {
        body: {
          query: queries.getItem,
          variables: {
            path: itemPath,
            language: config.language,
          },
        },
        query: {
          sitecoreContextId,
        }
      }
    } as any);

    let itemId: string | null = null;

    if (checkResult?.data?.data) {
      const data = checkResult.data?.data as any;
      if (data?.item?.itemId) {
        itemId = data.item.itemId;
      }
    }

    if (itemId) {
      // Item exists, update it
      await client.mutate("xmc.authoring.graphql", {
        params: {
          body: {
            query: queries.updateItem,
            variables: {
              itemId,
              language: config.language,
              version: 1,
              fields: [
                {
                  name: config.field,
                  value: key,
                },
              ],
            },
          },
          query: {
            sitecoreContextId,
          }
        }
      } as any);
    } else {
      // Item doesn't exist, create it

      await client.mutate("xmc.authoring.graphql", {
        params: {
          body: {
            query: queries.createItem,
            variables: {
              name,
              templateId: config.templateId,
              parent: config.rootId,
              language: config.language,
              fields: [
                {
                  name: config.field,
                  value: key,
                },
              ],
            }
          },
          query: {
            sitecoreContextId,
          }
        }
      } as any);
    }

    return true;
  } catch (error) {
    console.error("Error saving API key:", error);
    return false;
  }
}

/**
 * Configuration for API key storage
 */
export function getApiKeyStorageConfig() {
  return { ...config };
}

/**
 * Updates the storage configuration
 */
export function setApiKeyStorageConfig(newConfig: Partial<typeof config>) {
  Object.assign(config, newConfig);
}
