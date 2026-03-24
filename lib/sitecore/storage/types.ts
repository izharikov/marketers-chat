export type StorageFolder = {
  name: string;
  icon?: string;
};

export type ApiKeyStorageConfig = {
  templates: {
    item: { id: string; icon: string };
    folder: { id: string };
  };
  storage: {
    basePath: string;
    folders: StorageFolder[];
    fieldName: string;
    language: string;
  };
};
