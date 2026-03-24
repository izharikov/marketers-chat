import { ClientSDK } from '@sitecore-marketplace-sdk/client';

import { queries } from './queries';

type ItemFieldNode = { name: string; value: string };

type RawGetItemResult = {
  itemId: string;
  name: string;
  fields: { nodes: ItemFieldNode[] };
} | null;

export type ItemResult = {
  itemId: string;
  name: string;
  fields: Record<string, string>;
} | null;

type MutateItemResult = { itemId: string } | null;

function normalizeItem(raw: RawGetItemResult): ItemResult {
  if (!raw) return null;

  const fields: Record<string, string> = {};
  for (const node of raw.fields?.nodes ?? []) {
    fields[node.name] = node.value;
  }

  return { itemId: raw.itemId, name: raw.name, fields };
}

export class SitecoreGraphQLClient {
  constructor(
    private client: ClientSDK,
    private sitecoreContextId: string,
    private language: string
  ) {}

  async getItem(path: string): Promise<ItemResult> {
    const result = await this.client.mutate('xmc.authoring.graphql', {
      params: {
        body: {
          query: queries.getItem,
          variables: { path, language: this.language },
        },
        query: { sitecoreContextId: this.sitecoreContextId },
      },
    });

    const data = result?.data?.data as { item: RawGetItemResult };
    return normalizeItem(data?.item ?? null);
  }

  async createItem(
    name: string,
    templateId: string,
    parentId: string,
    fields: ItemFieldNode[] = []
  ): Promise<MutateItemResult> {
    const result = await this.client.mutate('xmc.authoring.graphql', {
      params: {
        body: {
          query: queries.createItem,
          variables: {
            name,
            templateId,
            parent: parentId,
            language: this.language,
            fields,
          },
        },
        query: { sitecoreContextId: this.sitecoreContextId },
      },
    });

    const data = result?.data?.data as {
      createItem: { item: MutateItemResult };
    };
    return data?.createItem?.item ?? null;
  }

  async updateItem(
    itemId: string,
    fields: ItemFieldNode[]
  ): Promise<MutateItemResult> {
    const result = await this.client.mutate('xmc.authoring.graphql', {
      params: {
        body: {
          query: queries.updateItem,
          variables: {
            itemId,
            language: this.language,
            fields,
          },
        },
        query: { sitecoreContextId: this.sitecoreContextId },
      },
    });

    const data = result?.data?.data as {
      updateItem: { item: MutateItemResult };
    };
    return data?.updateItem?.item ?? null;
  }

  async createOrUpdateItem(
    path: string,
    name: string,
    templateId: string,
    parentId: string,
    fields: ItemFieldNode[],
    createExtraFields: ItemFieldNode[] = []
  ): Promise<MutateItemResult> {
    const existing = await this.getItem(path);

    if (existing?.itemId) {
      await this.updateItem(existing.itemId, fields);
      return existing;
    }

    return this.createItem(name, templateId, parentId, [
      ...fields,
      ...createExtraFields,
    ]);
  }
}
