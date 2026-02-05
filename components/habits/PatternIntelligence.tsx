"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface PatternData {
  lowCompletionHabits: Array<{ name: string; rate: number }>;
  commonSkipReasons: Array<{ reason: string; count: number }>;
  recommendations: string[];
}

interface PatternIntelligenceProps {
  data: PatternData;
}

export function PatternIntelligence({ data }: PatternIntelligenceProps) {
  return (
    <Card className="border-border/50 bg-card/30">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <span>🧠</span>
          Pattern Intelligence
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        {data.lowCompletionHabits.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-muted-foreground">
              Struggling with:
            </h4>
            <div className="flex flex-wrap gap-2">
              {data.lowCompletionHabits.map((habit) => (
                <Badge
                  key={habit.name}
                  variant="secondary"
                  className="bg-orange-950/30 text-orange-400 hover:bg-orange-950/40"
                >
                  {habit.name} ({habit.rate}%)
                </Badge>
              ))}
            </div>
          </div>
        )}

        {data.commonSkipReasons.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-muted-foreground">
              Common skip reasons:
            </h4>
            <div className="flex flex-wrap gap-2">
              {data.commonSkipReasons.map((item) => (
                <Badge
                  key={item.reason}
                  variant="outline"
                  className="border-border/50"
                >
                  {item.reason} ({item.count}x)
                </Badge>
              ))}
            </div>
          </div>
        )}

        {data.recommendations.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-cyan-700 dark:text-cyan-400">Recommendations:</h4>
            <ul className="space-y-1 text-muted-foreground">
              {data.recommendations.map((rec, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-cyan-600 dark:text-cyan-500">→</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
