"use client";

import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ApiKey, LocalSettings } from "@/components/providers/app-settings-provider";
import { Eye, EyeOff } from "lucide-react";

interface AppSettingsModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    keys: Record<ApiKey, string>;
    localSettings: LocalSettings;
    onSave: (newKeys: Record<string, string>, newLocalSettings: LocalSettings) => Promise<void>;
    isClosable?: boolean;
}

function ApiKeyInput(props: React.ComponentProps<"input"> & { label: string }) {
    const [showPassword, setShowPassword] = useState(false)
    return (
        <div className="w-full max-w-sm space-y-2">
            <Label htmlFor={props.id}>{props.label}</Label>
            <div className="relative">
                <Input
                    className="bg-background pr-[2.2rem]"
                    type={showPassword ? "text" : "password"}
                    {...props}
                />
                <Button
                    className="absolute top-0 right-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    size="icon"
                    type="button"
                    variant="ghost"
                >
                    {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                </Button>
            </div>
        </div>
    )
}

export function AppSettingsModal({
    isOpen,
    onOpenChange,
    keys,
    localSettings,
    onSave,
    isClosable = true,
}: AppSettingsModalProps) {
    const [tempKeys, setTempKeys] = useState<Record<string, string>>({});
    const [tempSettings, setTempSettings] = useState<LocalSettings>(localSettings);
    const [isSaving, setIsSaving] = useState(false);

    // Sync with props when modal opens
    useEffect(() => {
        if (isOpen) {
            setTempKeys(keys);
            setTempSettings(localSettings);
        }
    }, [isOpen, keys, localSettings]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await onSave(tempKeys, tempSettings);
        } finally {
            setIsSaving(false);
        }
    };

    const handleKeyChange = (name: string, value: string) => {
        setTempKeys(prev => ({ ...prev, [name]: value }));
    };

    const handleSettingChange = (name: keyof LocalSettings, value: any) => {
        setTempSettings(prev => ({ ...prev, [name]: value }));
    };

    const hasKeys = Object.keys(keys).length > 0;

    return (
        <Dialog
            open={isOpen}
            onOpenChange={(open) => {
                if (!isClosable && !open) return;
                onOpenChange(open);
            }}
        >
            <DialogContent className="sm:max-w-[425px]" showCloseButton={isClosable}>
                <DialogHeader>
                    <DialogTitle>App Settings</DialogTitle>
                    <DialogDescription>
                        Configure your API keys and user preferences.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    {hasKeys && (
                        <div className="grid gap-4">
                            <h4 className="text-sm font-medium leading-none">API Keys</h4>
                            {Object.entries(keys).map(([name]) => (
                                <div key={name} className="grid w-full items-center gap-1.5">
                                    <ApiKeyInput
                                        id={`key-${name}`}
                                        label={name}
                                        value={tempKeys[name] || ""}
                                        onChange={(e) => handleKeyChange(name, e.target.value)}
                                    />
                                </div>
                            ))}
                        </div>
                    )}

                    <Separator />

                    <div className="grid gap-4">
                        <h4 className="text-sm font-medium leading-none">Preferences</h4>
                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="needsToolApproval"
                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                checked={tempSettings.needsToolApproval}
                                onChange={(e) => handleSettingChange('needsToolApproval', e.target.checked)}
                            />
                            <Label
                                htmlFor="needsToolApproval"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                Needs tool approval
                            </Label>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving ? "Saving..." : "Save"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
