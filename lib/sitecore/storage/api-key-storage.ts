import { ClientSDK } from '@sitecore-marketplace-sdk/client';

import { KnownFields, config } from './config';
import { SitecoreGraphQLClient } from './graphql-client';
import { PathCreationMutex } from './mutex';

const pathMutex = new PathCreationMutex();

function getStorageRoot(): string {
  const { basePath, folders } = config.storage;
  const segments = folders.map((f) => f.name).join('/');
  return `${basePath}/${segments}`;
}

async function ensurePathExists(
  gql: SitecoreGraphQLClient
): Promise<string> {
  return pathMutex.lock(async () => {
    const { basePath, folders } = config.storage;

    const baseItem = await gql.getItem(basePath);
    if (!baseItem?.itemId) {
      throw new Error(`Base path does not exist: ${basePath}`);
    }

    let parentId = baseItem.itemId;
    let currentPath = basePath;

    for (const folder of folders) {
      currentPath += `/${folder.name}`;

      const existing = await gql.getItem(currentPath);
      if (existing?.itemId) {
        parentId = existing.itemId;
      } else {
        const fields = folder.icon
          ? [{ name: KnownFields.Icon, value: folder.icon }]
          : [];

        const created = await gql.createItem(
          folder.name,
          config.templates.folder.id,
          parentId,
          fields
        );
        if (!created?.itemId) {
          throw new Error(`Failed to create folder: ${folder.name}`);
        }
        parentId = created.itemId;
      }
    }

    return parentId;
  });
}

export async function getApiKey(
  client: ClientSDK,
  sitecoreContextId: string,
  name: string
): Promise<string | null> {
  try {
    const gql = new SitecoreGraphQLClient(
      client,
      sitecoreContextId,
      config.storage.language
    );
    const item = await gql.getItem(`${getStorageRoot()}/${name}`);
    return item?.fields[config.storage.fieldName] ?? null;
  } catch (error) {
    console.error('Error fetching API key:', error);
    return null;
  }
}

export async function saveApiKey(
  client: ClientSDK,
  sitecoreContextId: string,
  name: string,
  key: string
): Promise<boolean> {
  try {
    const gql = new SitecoreGraphQLClient(
      client,
      sitecoreContextId,
      config.storage.language
    );
    const parentId = await ensurePathExists(gql);
    const { item } = config.templates;

    const iconFields = item.icon
      ? [{ name: KnownFields.Icon, value: item.icon }]
      : [];

    await gql.createOrUpdateItem(
      `${getStorageRoot()}/${name}`,
      name,
      item.id,
      parentId,
      [{ name: config.storage.fieldName, value: key }],
      iconFields
    );

    return true;
  } catch (error) {
    console.error('Error saving API key:', error);
    throw error;
  }
}
