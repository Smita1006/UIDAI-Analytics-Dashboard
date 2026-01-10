"use client";

import { TimeSeriesAnalysis } from "./time-series-analysis";

interface TemporalTabProps {
  data?: any;
}

export function TemporalTab({ data }: TemporalTabProps) {
  return <TimeSeriesAnalysis data={data} />;
}
