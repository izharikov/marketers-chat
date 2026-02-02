"use client";

import React, { useState } from "react";
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

interface ApiKeyModalProps {
    description: string;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (key: string) => void;
    defaultValue?: string;
    isClosable?: boolean;
}

export function ApiKeyModal({
    description,
    isOpen,
    onOpenChange,
    onSave,
    defaultValue = "",
    isClosable = true,
}: ApiKeyModalProps) {
    const [inputValue, setInputValue] = useState(defaultValue);

    const handleSave = () => {
        if (inputValue.trim()) {
            onSave(inputValue.trim());
        }
    };

    return (
        <Dialog
            open={isOpen}
            onOpenChange={(open) => {
                if (!isClosable && !open) return;
                onOpenChange(open);
            }}
        >
            <DialogContent showCloseButton={isClosable}>
                <DialogHeader>
                    <DialogTitle>API Key Required</DialogTitle>
                    <DialogDescription>
                        {`API key ${description} is missing, please provide it:`}
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <Input
                        type="password"
                        placeholder={`Enter ${description} API key`}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSave()}
                        autoFocus
                    />
                </div>
                <DialogFooter>
                    <Button onClick={handleSave} disabled={!inputValue.trim()}>
                        Save API Key
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
