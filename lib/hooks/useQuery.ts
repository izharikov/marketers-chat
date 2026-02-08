import { useMarketplaceClient } from "@/components/providers/marketplace";
import { QueryKey, QueryResult } from "@sitecore-marketplace-sdk/client";
import { useEffect, useState } from "react";

export function useSubscribeQuery<K extends QueryKey>(key: K) {
    const client = useMarketplaceClient();
    const [result, setResult] = useState<QueryResult<K>['data']>();
    useEffect(() => {
        client && client.query(key, {
            subscribe: true,
            onSuccess: (res) => {
                setResult(res);
            },
        })
            .then((res) => {
                setResult(res.data);
            })
            .catch((error) => {
                setResult(error);
            });

    }, [client, key]);

    return result;
}

export const usePagesContext = () => useSubscribeQuery("pages.context");

