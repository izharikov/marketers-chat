"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { ApiKeyModal } from "@/components/custom/api-key-modal";
import { useAppContext, useMarketplaceClient } from "@/components/providers/marketplace";
import { getApiKey, saveApiKey } from "@/lib/sitecore/storage/api-key-storage";

/**
 * Supported API key names
 */
export type ApiKey = 'vercel' | 'openai' | 'anthropic' | 'google';

/**
 * Hook to handle getting and saving API keys using Sitecore GraphQL API.
 */
function useApiKeyStorage(name: ApiKey) {
    const client = useMarketplaceClient();
    const appContext = useAppContext();
    const [apiKey, setApiKey] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const sitecoreContextId = appContext?.resourceAccess?.[0]?.context?.preview!;

    useEffect(() => {
        // Initial fetch from Sitecore
        const fetchKey = async () => {
            const key = await getApiKey(client, sitecoreContextId, name);
            setApiKey(key);
            setLoading(false);
        };

        fetchKey();
    }, []);

    const saveKey = async (key: string) => {
        const success = await saveApiKey(client, sitecoreContextId, name, key);
        if (success) {
            setApiKey(key);
        }
    };

    return { apiKey, saveKey, loading };
}

interface ApiKeyContextType {
    keys: Record<string, string>;
}

const ApiKeyContext = createContext<ApiKeyContextType | undefined>(undefined);

export interface ApiKeyProviderProps {
    name: ApiKey;
    description: string;
    children: React.ReactNode;
}

export function ApiKeyProvider({
    name,
    description,
    children,
}: ApiKeyProviderProps) {
    const { apiKey, saveKey, loading } = useApiKeyStorage(name);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Consume parent context if it exists to support nesting/multiple keys
    const parentContext = useContext(ApiKeyContext);

    useEffect(() => {
        if (!loading && !apiKey) {
            setIsModalOpen(true);
        }
    }, [loading, apiKey]);

    const handleSave = async (key: string) => {
        await saveKey(key);
        setIsModalOpen(false);
    };

    // Don't render until we know the state of the key
    if (loading) return null;

    const mergedKeys = {
        ...(parentContext?.keys || {}),
        ...(apiKey ? { [name]: apiKey } : {}),
    };

    return (
        <ApiKeyContext.Provider value={{ keys: mergedKeys }}>
            {apiKey ? children : null}
            <ApiKeyModal
                description={description}
                isOpen={isModalOpen}
                onOpenChange={setIsModalOpen}
                onSave={handleSave}
                isClosable={!!apiKey}
            />
        </ApiKeyContext.Provider>
    );
}

/**
 * Hook to access an API key by name from the nearest ApiKeyProvider.
 */
export function useApiKey(name: ApiKey): string | undefined {
    const context = useContext(ApiKeyContext);
    if (context === undefined) {
        throw new Error("useApiKey must be used within an ApiKeyProvider");
    }
    return context.keys[name];
}
