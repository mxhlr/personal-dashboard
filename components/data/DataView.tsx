"use client";

import { DailyDataView } from "./DailyDataView";
import { WeeklyDataView } from "./WeeklyDataView";
import { MonthlyDataView } from "./MonthlyDataView";
import { QuarterlyDataView } from "./QuarterlyDataView";
import { AnnualDataView } from "./AnnualDataView";

type ViewType = "daily" | "weekly" | "monthly" | "quarterly" | "annual";

interface DataViewProps {
  selectedView: ViewType;
}

export function DataView({ selectedView }: DataViewProps) {
  return (
    <div>
      {selectedView === "daily" && <DailyDataView />}
      {selectedView === "weekly" && <WeeklyDataView />}
      {selectedView === "monthly" && <MonthlyDataView />}
      {selectedView === "quarterly" && <QuarterlyDataView />}
      {selectedView === "annual" && <AnnualDataView />}
    </div>
  );
}
