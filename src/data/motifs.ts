/** Background-art styles for project cards and Journey episodes. Drawn in components/Poster.tsx. */
export const MOTIFS = [
  { id: 'shield', label: 'Shield' },
  { id: 'flow', label: 'Flow' },
  { id: 'tenants', label: 'Grid' },
  { id: 'neural', label: 'Neural network' },
  { id: 'chip', label: 'Microchip' },
  { id: 'terminal', label: 'Terminal' },
  { id: 'network', label: 'Network' },
  { id: 'chart', label: 'Chart' },
  { id: 'chat', label: 'Chat' },
  { id: 'database', label: 'Database' },
  { id: 'signal', label: 'Signal' },
] as const;

export type Motif = (typeof MOTIFS)[number]['id'];

export const MOTIF_IDS: string[] = MOTIFS.map((m) => m.id);
