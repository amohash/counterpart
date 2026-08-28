import { useCallback, useState } from 'react';
import type { MonthlySeriesId } from '../model';

export interface ExtraChartSpec {
  id: string;
  seriesIds: MonthlySeriesId[];
  title: string;
}

let nextId = 1;

export interface UseChartsResult {
  charts: ExtraChartSpec[];
  addChart: (seriesIds: MonthlySeriesId[], title: string) => ExtraChartSpec;
}

export function useCharts(): UseChartsResult {
  const [charts, setCharts] = useState<ExtraChartSpec[]>([]);

  const addChart = useCallback((seriesIds: MonthlySeriesId[], title: string) => {
    const chart: ExtraChartSpec = { id: `chart-${nextId}`, seriesIds, title };
    nextId += 1;
    setCharts((current) => [...current, chart]);
    return chart;
  }, []);

  return { charts, addChart };
}
