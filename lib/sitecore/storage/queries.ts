export const queries = {
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
}`,
};
