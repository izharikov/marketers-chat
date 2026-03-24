import type { ApiKeyStorageConfig } from './types';

export const KnownTemplates = {
  Property: '{97D75760-CF8B-4740-810B-7727B564EF4D}',   // /sitecore/templates/System/Property
  Folder: '{A87A00B1-E6DB-45AB-8B54-636FEC3B5523}',     // /sitecore/templates/Common/Folder
} as const;

export const KnownIcons = {
  Key: 'Office/32x32/key.png',
  Keys: 'Office/32x32/keys.png',
  WindowGear: 'Office/32x32/window_gear.png',
} as const;

export const KnownPaths = {
  Modules: '/sitecore/system/Modules',
} as const;

export const KnownFields = {
  Icon: '__Icon',
} as const;

export const config: ApiKeyStorageConfig = {
  templates: {
    item: { id: KnownTemplates.Property, icon: KnownIcons.Key },
    folder: { id: KnownTemplates.Folder },
  },
  storage: {
    basePath: KnownPaths.Modules,
    folders: [
      { name: 'Editors Chat', icon: KnownIcons.WindowGear },
      { name: 'Api Keys', icon: KnownIcons.Keys },
    ],
    fieldName: 'Value',
    language: 'en',
  },
};
