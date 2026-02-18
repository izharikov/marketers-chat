import { experimental_XMC } from '@sitecore-marketplace-sdk/xmc';
import * as clientTools from './client';
import * as serverTools from './server';
import { NeedsApproval } from './types';

export type CreateSitecoreToolsOptions = (
  | {
      execution: 'client';
    }
  | {
      execution: 'server';
      client: experimental_XMC;
      sitecoreContextId: string;
    }
) & {
  needsApproval?: NeedsApproval;
};

export function createSitecoreTools(options: CreateSitecoreToolsOptions) {
  if (options.execution === 'client') {
    return {
      ...clientTools.assetTools(options),
      ...clientTools.componentsTools(options),
      ...clientTools.contentTools(options),
      ...clientTools.environmentTools(options),
      ...clientTools.pagesTools(options),
      ...clientTools.personalizationTools(options),
      ...clientTools.sitesTools(options),
      ...clientTools.jobTools(options),
    };
  } else {
    return {
      ...serverTools.assetTools(
        options.client,
        options.sitecoreContextId,
        options
      ),
      ...serverTools.componentsTools(
        options.client,
        options.sitecoreContextId,
        options
      ),
      ...serverTools.contentTools(
        options.client,
        options.sitecoreContextId,
        options
      ),
      ...serverTools.environmentTools(
        options.client,
        options.sitecoreContextId,
        options
      ),
      ...serverTools.pagesTools(
        options.client,
        options.sitecoreContextId,
        options
      ),
      ...serverTools.personalizationTools(
        options.client,
        options.sitecoreContextId,
        options
      ),
      ...serverTools.sitesTools(
        options.client,
        options.sitecoreContextId,
        options
      ),
      ...serverTools.jobTools(
        options.client,
        options.sitecoreContextId,
        options
      ),
    };
  }
}
