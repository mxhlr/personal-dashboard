"use client";

interface PatternData {
  lowCompletionHabits: Array<{ name: string; rate: number }>;
  commonSkipReasons: Array<{ reason: string; count: number }>;
  recommendations: string[];
}

interface PatternIntelligenceProps {
  data: PatternData;
}

export function PatternIntelligence({ data }: PatternIntelligenceProps) {
  const topSkipReason = data.commonSkipReasons[0];

  return (
    <div className="rounded-xl border dark:border-[rgba(0,229,255,0.15)] border-[rgba(0,180,220,0.2)] dark:bg-[rgba(0,229,255,0.03)] bg-[rgba(0,180,220,0.04)] p-5 space-y-4">
      <h3 className="text-base font-bold font-orbitron dark:text-[#E0E0E0] text-[#1A1A1A]">
        🧠 Pattern Intelligence
      </h3>

      <div className="space-y-4">
        {data.lowCompletionHabits.map((habit) => (
          <p key={habit.name} className="text-sm leading-relaxed font-orbitron">
            <span className="font-bold dark:text-[#E0E0E0] text-[#1A1A1A]">
              {habit.name}
            </span>
            {" "}only completed{" "}
            <span className="font-bold text-[#FF4444]">
              {habit.rate}%
            </span>
            {" "}
            <span className="dark:text-[#999999] text-[#3d3d3d]">
              of days. Consider restructuring.
            </span>
          </p>
        ))}

        {topSkipReason && topSkipReason.count > 0 && (
          <p className="text-sm leading-relaxed font-orbitron">
            <span className="dark:text-[#999999] text-[#3d3d3d]">
              Top skip reason:{" "}
            </span>
            <span className="font-bold text-[#FF4444]">
              &quot;{topSkipReason.reason}&quot;
            </span>
            {" "}
            <span className="dark:text-[#999999] text-[#3d3d3d]">
              ({topSkipReason.count} times). Address this blocker.
            </span>
          </p>
        )}
      </div>
    </div>
  );
}
