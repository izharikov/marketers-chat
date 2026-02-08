import { useApiKey } from "@/components/providers/api-key-provider";
import { useMarketplaceClient } from "@/components/providers/marketplace";
import { usePagesContext } from "@/lib/hooks/useQuery";
import { useChat } from "@ai-sdk/react";
import { ClientSDK, PagesContext } from "@sitecore-marketplace-sdk/client";
import { DefaultChatTransport } from "ai";
import { useEffect, useState } from "react";

export const CustomFieldPage = () => {
    const client = useMarketplaceClient();
    const pageContext = usePagesContext();
    const apiKey = useApiKey('vercel');
    const { messages, status } = useChat({
        transport: new DefaultChatTransport({
            api: '/api/schema-org',
            headers: {
                'x-vercel-api-key': apiKey!,
            },
            body: {}
        })
    });
    const [value, setValue] = useState<string | undefined>(undefined);
    useEffect(() => {
        async function fetchValue() {
            const res = await client.getValue();
            setValue(res);
            if (res) {
                setValueState('preview');
            }
        };
        fetchValue();
    }, []);
    const [valueState, setValueState] = useState<'preview' | 'diff' | 'none'>('none');
    return (
        <div>
            <div>
                {/* Render (preview) diff or existing value */}
            </div>
            <div>
                {/* render button to generate new value for schema org */}
            </div>
        </div>
    );
}

const getRenderPageResult = async (client: ClientSDK, pageContext: PagesContext, sitecoreContextId: string) => {
    const { pageInfo, siteInfo } = pageContext;
    if (!pageInfo || !siteInfo) {
        return;
    }
    const renderedResult = await client.mutate("xmc.live.graphql", {
        params: {
            body: {
                query: `query {
  layout(site: "${siteInfo.name}", routePath: "${pageInfo.route}", language: "${pageInfo.language}") {
    item {
      rendered
    }
  }
}`
            },
            query: {
                sitecoreContextId,
            }
        }
    });

    return (renderedResult?.data?.data?.layout as any)?.item?.rendered?.sitecore?.route?.placeholders;
} 