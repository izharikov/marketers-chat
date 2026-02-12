"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { AppSettingsModal } from "@/components/custom/api-key-modal";
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

interface AppSettingsContextType {
    keys: Record<string, string>;
    setModalOpen: (open: boolean) => void;
}

const AppSettingsContext = createContext<AppSettingsContextType | undefined>(undefined);

export interface AppSettingsProviderProps {
    name: ApiKey;
    description: string;
    children: React.ReactNode;
}

export function AppSettingsProvider({
    name,
    description,
    children,
}: AppSettingsProviderProps) {
    const { apiKey, saveKey, loading } = useApiKeyStorage(name);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Consume parent context if it exists to support nesting/multiple keys
    const parentContext = useContext(AppSettingsContext);

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
        <AppSettingsContext.Provider value={{ keys: mergedKeys, setModalOpen: setIsModalOpen }}>
            {apiKey ? children : null}
            <AppSettingsModal
                description={description}
                isOpen={isModalOpen}
                onOpenChange={setIsModalOpen}
                onSave={handleSave}
                isClosable={!!apiKey}
            />
        </AppSettingsContext.Provider>
    );
}

/**
 * Hook to access an API key by name from the nearest ApiKeyProvider.
 */
export function useApiKey(name: ApiKey): string | undefined {
    const context = useContext(AppSettingsContext);
    if (context === undefined) {
        throw new Error("useApiKey must be used within an ApiKeyProvider");
    }
    return context.keys[name];
}

export function useAppSettings() {
    const context = useContext(AppSettingsContext);
    return { setModalOpen: context?.setModalOpen };
}
