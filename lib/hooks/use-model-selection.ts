'use client';

import { useEffect, useState } from 'react';
import { models } from '@/lib/ai/models';
import { Capability } from '@/lib/tools/capabilities';

export function useModelSelection(
  initialCapabilities: Capability[],
  onSetModel: (model: string) => void,
  onCapabilitiesChange?: (capabilities: Capability[]) => void
) {
  const [model, setModel] = useState<string>(models[0].id);
  const [modelSelectorOpen, setModelSelectorOpen] = useState(false);
  const selectedModelData = models.find((m) => m.id === model);

  const [capabilities, setCapabilities] =
    useState<Capability[]>(initialCapabilities);

  const toggleCapability = (cap: Capability) => {
    setCapabilities((prev) =>
      prev.includes(cap) ? prev.filter((c) => c !== cap) : [...prev, cap]
    );
  };

  useEffect(() => {
    onSetModel(model);
  }, [model, onSetModel]);

  useEffect(() => {
    onCapabilitiesChange?.(capabilities);
  }, [capabilities, onCapabilitiesChange]);

  return {
    model,
    setModel,
    modelSelectorOpen,
    setModelSelectorOpen,
    selectedModelData,
    capabilities,
    toggleCapability,
  };
}
