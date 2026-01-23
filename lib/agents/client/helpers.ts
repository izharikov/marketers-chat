import { ClientSDK, QueryKey, QueryOptions, MutationKey, MutationOptions } from "@sitecore-marketplace-sdk/client";
import { z } from "zod/v4";

export type ToolConfig<TInput> = {
    inputSchema: z.ZodType<TInput>;
    execute: (client: ClientSDK, sitecoreContextId: string | undefined, input: TInput) => Promise<any>;
}

export function clientTool<TInput>(config: ToolConfig<TInput>) {
    return config.execute;
}

export async function clientQuery<K extends QueryKey>(client: ClientSDK, query: K, params: QueryOptions<K>) {
    try {
        const res = await client.query(query, params);
        if (res.isSuccess) {
            if (typeof res.data === 'string') {
                return res.data;
            }

            return {
                ...res.data as object,
                request: null,
                response: null,
            }
        }

        console.log('error', res.error, res.data);
        return {
            error: res.error,
            data: res.data,
        }
    } catch (error) {
        console.log('Error fetching data', error);
        return 'Error occurred while fetching data';
    }
}

export async function clientMutate<K extends MutationKey>(client: ClientSDK, mutation: K, params: MutationOptions<K>) {
    try {
        const res = await client.mutate(mutation, params);
        if (typeof res === 'string') {
            return res;
        }

        return {
            ...res as object,
            request: null,
            response: null,
        }
    } catch (error) {
        console.log('Error mutating data', error);
        return 'Error occurred while mutating data';
    }
}

