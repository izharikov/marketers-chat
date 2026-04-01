'use client';

import React, { useEffect, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import {
  AgentApiSettings,
  ApiKey,
  LocalSettings,
} from '@/components/providers/app-settings-provider';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';

interface AppSettingsModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  keys: Record<ApiKey, string>;
  localSettings: LocalSettings;
  onSave: (
    newKeys: Record<string, string>,
    newLocalSettings: LocalSettings
  ) => Promise<void>;
  isClosable?: boolean;
}

function ApiKeyInput(props: React.ComponentProps<'input'> & { label: string }) {
  const [showPassword, setShowPassword] = useState(false);
  return (
    <div className='w-full max-w-sm space-y-2'>
      <Label htmlFor={props.id} tabIndex={1}>
        {props.label}
      </Label>
      <div className='relative'>
        <Input
          className='bg-background pr-[2.2rem]'
          type={showPassword ? 'text' : 'password'}
          {...props}
        />
        <Button
          className='absolute top-0 right-0 h-full px-3 hover:bg-transparent'
          onClick={() => setShowPassword(!showPassword)}
          size='icon'
          type='button'
          variant='ghost'
        >
          {showPassword ? (
            <EyeOff className='h-4 w-4 text-muted-foreground' />
          ) : (
            <Eye className='h-4 w-4 text-muted-foreground' />
          )}
        </Button>
      </div>
    </div>
  );
}

const labels: Record<string, string> = {
  vercel: 'Vercel Gateway API Key',
};

export function AppSettingsModal({
  isOpen,
  onOpenChange,
  keys,
  localSettings,
  onSave,
  isClosable = true,
}: AppSettingsModalProps) {
  const [tempKeys, setTempKeys] = useState<Record<string, string>>({});
  const [tempSettings, setTempSettings] =
    useState<LocalSettings>(localSettings);
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
    setTempKeys((prev) => ({ ...prev, [name]: value }));
  };

  const handleAgentApiChange = (
    name: keyof AgentApiSettings,
    value: unknown
  ) => {
    setTempSettings((prev) => ({
      ...prev,
      agentApi: { ...prev.agentApi, [name]: value },
    }));
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
      <DialogContent className='sm:max-w-[425px]' showCloseButton={isClosable}>
        <DialogHeader>
          <DialogTitle>App Settings</DialogTitle>
          <DialogDescription>
            Configure your API keys and user preferences.
          </DialogDescription>
        </DialogHeader>

        <div className='grid gap-4 py-4'>
          {hasKeys && (
            <div className='grid gap-4 rounded-lg border p-4'>
              <h4 className='text-sm font-medium leading-none'>API Keys</h4>
              {Object.entries(keys).map(([name]) => (
                <div key={name} className='grid w-full items-center gap-1.5'>
                  <ApiKeyInput
                    id={`key-${name}`}
                    label={labels[name] || name}
                    value={tempKeys[name] || ''}
                    onChange={(e) => handleKeyChange(name, e.target.value)}
                  />
                </div>
              ))}
            </div>
          )}

          <div className='grid gap-4 rounded-lg border p-4'>
            <h4 className='text-sm font-medium leading-none'>Agent API</h4>

            <div className='flex items-center space-x-2'>
              <Switch
                id='agentNeedsApproval'
                checked={tempSettings.agentApi.needsApproval}
                onCheckedChange={(checked) =>
                  handleAgentApiChange('needsApproval', checked)
                }
              />
              <Label
                htmlFor='agentNeedsApproval'
                className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
              >
                Require approval
              </Label>
            </div>

            {tempSettings.agentApi.needsApproval && (
              <div className='flex flex-col gap-4'>
                <Label className='text-sm font-medium leading-none'>
                  Approval scope
                </Label>
                <RadioGroup
                  value={tempSettings.agentApi.approvalFor}
                  className='w-fit'
                  onValueChange={(value) =>
                    handleAgentApiChange('approvalFor', value)
                  }
                >
                  <div className='flex items-center gap-3'>
                    <RadioGroupItem value='all' id='approvalFor-all' />
                    <Label htmlFor='approvalFor-all'>All tools</Label>
                  </div>
                  <div className='flex items-center gap-3'>
                    <RadioGroupItem
                      value='mutations'
                      id='approvalFor-mutations'
                    />
                    <Label htmlFor='approvalFor-mutations'>
                      Mutations only
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            )}

            <div className='flex flex-col gap-4'>
              <Label className='text-sm font-medium leading-none'>
                Execution
              </Label>
              <RadioGroup
                value={tempSettings.agentApi.execution}
                className='w-fit'
                onValueChange={(value) =>
                  handleAgentApiChange('execution', value)
                }
              >
                <div className='flex items-center gap-3'>
                  <RadioGroupItem value='frontend' id='execution-frontend' />
                  <Label htmlFor='execution-frontend'>Frontend</Label>
                </div>
                <div className='flex items-center gap-3'>
                  <RadioGroupItem value='backend' id='execution-backend' />
                  <Label htmlFor='execution-backend'>Backend</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
