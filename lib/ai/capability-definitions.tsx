import { FilePlus, GlobeIcon, ImageIcon, LayoutIcon, UsersIcon } from 'lucide-react';
import { Capability } from '@/lib/tools/capabilities';

export type CapabilityDefinition = {
  id: Capability;
  label: string;
  icon: React.ReactNode;
};

export const allCapabilities: CapabilityDefinition[] = [
  {
    id: 'page_layout',
    label: 'Page Layout',
    icon: <LayoutIcon className='size-4' />,
  },
  {
    id: 'sites',
    label: 'Sites',
    icon: <GlobeIcon className='size-4' />,
  },
  {
    id: 'page_management',
    label: 'Page Management',
    icon: <FilePlus className='size-4' />,
  },
  {
    id: 'assets',
    label: 'Assets',
    icon: <ImageIcon className='size-4' />,
  },
  {
    id: 'personalization',
    label: 'Personalization',
    icon: <UsersIcon className='size-4' />,
  },
  {
    id: 'websearch',
    label: 'Web Search',
    icon: <GlobeIcon className='size-4' />,
  },
];
