"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface ReviewNotification {
  type: "weekly" | "monthly" | "quarterly" | "annual";
  label: string;
  daysUntil: number;
  timeString: string;
}

export function ReviewNotificationBar() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<ReviewNotification[]>([]);

  const handleStartReview = (type: string) => {
    router.push(`/?tab=planning&review=${type}`);
  };

  useEffect(() => {
    const calculateNotifications = () => {
      const now = new Date();
      const notifs: ReviewNotification[] = [];

      // Weekly Review - Sonntag 18:00 Uhr
      const nextSunday = new Date(now);
      const daysUntilSunday = (7 - now.getDay()) % 7 || 7;
      nextSunday.setDate(now.getDate() + daysUntilSunday);
      nextSunday.setHours(18, 0, 0, 0);

      // If it's Sunday but past 18:00, add 7 days
      if (now.getDay() === 0 && now.getHours() >= 18) {
        nextSunday.setDate(nextSunday.getDate() + 7);
      }

      const daysUntilWeekly = Math.ceil((nextSunday.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      notifs.push({
        type: "weekly",
        label: "Weekly Review",
        daysUntil: daysUntilWeekly,
        timeString: daysUntilWeekly === 0 ? "heute" : daysUntilWeekly === 1 ? "morgen" : `in ${daysUntilWeekly} Tagen`,
      });

      // Monthly Review - Letzter Tag des Monats
      const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      const daysUntilMonthly = Math.ceil((lastDayOfMonth.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      notifs.push({
        type: "monthly",
        label: "Monthly Review",
        daysUntil: daysUntilMonthly,
        timeString: daysUntilMonthly === 0 ? "heute" : daysUntilMonthly === 1 ? "morgen" : `in ${daysUntilMonthly} Tagen`,
      });

      // Quarterly Review - Letzter Tag des Quarters (31 Mar, 30 Jun, 30 Sep, 31 Dec)
      const quarter = Math.floor(now.getMonth() / 3);
      const lastDayOfQuarter = new Date(now.getFullYear(), (quarter + 1) * 3, 0);
      const daysUntilQuarterly = Math.ceil((lastDayOfQuarter.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      notifs.push({
        type: "quarterly",
        label: "Quarterly Review",
        daysUntil: daysUntilQuarterly,
        timeString: daysUntilQuarterly === 0 ? "heute" : daysUntilQuarterly === 1 ? "morgen" : `in ${daysUntilQuarterly} Tagen`,
      });

      // Annual Review - 31. Dezember
      const lastDayOfYear = new Date(now.getFullYear(), 11, 31);
      const daysUntilAnnual = Math.ceil((lastDayOfYear.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      notifs.push({
        type: "annual",
        label: "Annual Review",
        daysUntil: daysUntilAnnual,
        timeString: daysUntilAnnual === 0 ? "heute" : daysUntilAnnual === 1 ? "morgen" : `in ${daysUntilAnnual} Tagen`,
      });

      // Only show reviews that are in the next 3 days
      const upcomingNotifs = notifs.filter(n => n.daysUntil <= 3);
      setNotifications(upcomingNotifs);
    };

    calculateNotifications();
    // Update every hour
    const interval = setInterval(calculateNotifications, 1000 * 60 * 60);
    return () => clearInterval(interval);
  }, []);

  if (notifications.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <p
          className="text-[11px] dark:text-[#666666] text-[#999999]"
          style={{ fontFamily: '"Courier New", "Monaco", monospace' }}
        >
          Keine anstehenden Reviews
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col justify-between">
      <div>
        <h3
          className="text-[11px] font-bold uppercase tracking-wider dark:text-[#888888] text-[#666666] mb-4"
          style={{ fontFamily: '"Courier New", "Monaco", monospace' }}
        >
          Upcoming Reviews
        </h3>

        <div className="space-y-2">
          {notifications.map((notif) => (
            <div
              key={notif.type}
              className="group flex items-center justify-between px-3 py-2 rounded-lg
                dark:bg-white/[0.03] bg-black/[0.02]
                dark:border dark:border-white/[0.08] border border-black/[0.05]
                hover:dark:bg-white/[0.05] hover:bg-black/[0.03]
                transition-all duration-200"
            >
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  notif.daysUntil === 0 ? 'bg-red-500 animate-pulse' :
                  notif.daysUntil === 1 ? 'bg-orange-500' :
                  'bg-yellow-500'
                }`} />
                <span
                  className="text-[11px] font-bold uppercase tracking-wider dark:text-[#888888] text-[#666666]"
                  style={{ fontFamily: '"Courier New", "Monaco", monospace' }}
                >
                  {notif.label}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="text-[11px] dark:text-[#E0E0E0] text-[#1A1A1A] font-medium"
                  style={{ fontFamily: '"Courier New", "Monaco", monospace' }}
                >
                  {notif.timeString}
                </span>
                <button
                  onClick={() => handleStartReview(notif.type)}
                  className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider
                    dark:bg-white/[0.06] bg-black/[0.04]
                    dark:border dark:border-white/[0.1] border border-black/[0.08]
                    dark:text-[#E0E0E0] text-[#1A1A1A]
                    dark:hover:bg-white/[0.1] hover:bg-black/[0.06]
                    transition-all duration-200 rounded"
                  style={{ fontFamily: '"Courier New", "Monaco", monospace' }}
                >
                  Start
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
