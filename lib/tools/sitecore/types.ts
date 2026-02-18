import { ClientSDK } from '@sitecore-marketplace-sdk/client';
import { tool } from 'ai';
import {
  assetToolsConfig,
  componentsToolsConfig,
  contentToolsConfig,
  environmentToolsConfig,
  jobToolsConfig,
  pagesToolsConfig,
  personalizationToolsConfig,
  sitesToolsConfig,
} from './definitions';

export type NeedsApproval = Parameters<typeof tool>[0]['needsApproval'];

export type SitecoreToolName =
  | keyof typeof assetToolsConfig
  | keyof typeof pagesToolsConfig
  | keyof typeof personalizationToolsConfig
  | keyof typeof sitesToolsConfig
  | keyof typeof environmentToolsConfig
  | keyof typeof jobToolsConfig
  | keyof typeof componentsToolsConfig
  | keyof typeof contentToolsConfig;

export type ClientSideContext = {
  client: ClientSDK;
  sitecoreContextId: string;
};

export type ClientSideTool = {
  toolName: string;
  input: unknown;
};
