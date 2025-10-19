import type { TickLevel } from '@/types';
import type { ChartConfig } from '@/components/ui/chart';

export const TICK_LEVELS: TickLevel[] = [
  { value: '0.1', label: '0.1' },
  { value: '1', label: '1.0' },
  { value: '10', label: '10.0' },
  { value: '50', label: '50.0' },
  { value: '100', label: '100.0' },
];

export const CHART_CONFIG: ChartConfig = {
  bid: {
    label: 'Bid',
    color: 'rgb(34, 197, 94)',
  },
  ask: {
    label: 'Ask',
    color: 'rgb(239, 68, 68)',
  },
};

export const ORDERBOOK_ROWS_PER_SIDE = 10;