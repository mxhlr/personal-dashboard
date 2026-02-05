"use client";

import { useMemo } from "react";

const STOIC_QUOTES = [
  {
    text: "You have power over your mind - not outside events. Realize this, and you will find strength.",
    author: "Marcus Aurelius"
  },
  {
    text: "The happiness of your life depends upon the quality of your thoughts.",
    author: "Marcus Aurelius"
  },
  {
    text: "Waste no more time arguing about what a good man should be. Be one.",
    author: "Marcus Aurelius"
  },
  {
    text: "If it is not right, do not do it. If it is not true, do not say it.",
    author: "Marcus Aurelius"
  },
  {
    text: "The best revenge is to be unlike him who performed the injury.",
    author: "Marcus Aurelius"
  },
  {
    text: "We suffer more often in imagination than in reality.",
    author: "Seneca"
  },
  {
    text: "Luck is what happens when preparation meets opportunity.",
    author: "Seneca"
  },
  {
    text: "He who fears death will never do anything worthy of a man who is alive.",
    author: "Seneca"
  },
  {
    text: "Begin at once to live, and count each separate day as a separate life.",
    author: "Seneca"
  },
  {
    text: "Difficulties strengthen the mind, as labor does the body.",
    author: "Seneca"
  },
  {
    text: "Wealth consists not in having great possessions, but in having few wants.",
    author: "Epictetus"
  },
  {
    text: "It's not what happens to you, but how you react to it that matters.",
    author: "Epictetus"
  },
  {
    text: "First say to yourself what you would be; and then do what you have to do.",
    author: "Epictetus"
  },
  {
    text: "No man is free who is not master of himself.",
    author: "Epictetus"
  },
  {
    text: "He is a wise man who does not grieve for the things which he has not, but rejoices for those which he has.",
    author: "Epictetus"
  },
  {
    text: "The obstacle is the way.",
    author: "Marcus Aurelius"
  },
  {
    text: "Very little is needed to make a happy life; it is all within yourself.",
    author: "Marcus Aurelius"
  },
  {
    text: "The soul becomes dyed with the color of its thoughts.",
    author: "Marcus Aurelius"
  },
  {
    text: "He who lives in harmony with himself lives in harmony with the universe.",
    author: "Marcus Aurelius"
  },
  {
    text: "Accept the things to which fate binds you, and love the people with whom fate brings you together, but do so with all your heart.",
    author: "Marcus Aurelius"
  },
  {
    text: "If a man knows not which port he sails, no wind is favorable.",
    author: "Seneca"
  },
  {
    text: "As long as you live, keep learning how to live.",
    author: "Seneca"
  },
  {
    text: "True happiness is to enjoy the present, without anxious dependence upon the future.",
    author: "Seneca"
  },
  {
    text: "The whole future lies in uncertainty: live immediately.",
    author: "Seneca"
  },
  {
    text: "Life is very short and anxious for those who forget the past, neglect the present, and fear the future.",
    author: "Seneca"
  },
  {
    text: "Don't explain your philosophy. Embody it.",
    author: "Epictetus"
  },
  {
    text: "Only the educated are free.",
    author: "Epictetus"
  },
  {
    text: "Caretake this moment. Immerse yourself in its particulars.",
    author: "Epictetus"
  },
  {
    text: "Freedom is the only worthy goal in life. It is won by disregarding things that lie beyond our control.",
    author: "Epictetus"
  },
  {
    text: "To bear trials with a calm mind robs misfortune of its strength and burden.",
    author: "Seneca"
  },
  {
    text: "The best time to plant a tree was 20 years ago. The second best time is now.",
    author: "Ancient Proverb"
  }
];

export function StoicQuote() {
  // Get today's quote based on the day of year
  const todayQuote = useMemo(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);

    // Use day of year to select quote (cycles through array)
    const index = dayOfYear % STOIC_QUOTES.length;
    return STOIC_QUOTES[index];
  }, []);

  return (
    <div
      className="relative overflow-hidden p-6 backdrop-blur-[10px] border transition-all duration-500 hover:scale-[1.01]
        dark:border-white/[0.08] border-black/[0.08]"
      style={{
        background: 'linear-gradient(135deg, rgba(26, 26, 26, 0.6) 0%, rgba(20, 20, 20, 0.8) 100%)',
        borderRadius: '16px',
        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.15)',
      }}
    >
      {/* Subtle corner accent */}
      <div className="absolute top-0 right-0 w-32 h-32 opacity-10"
        style={{
          background: 'radial-gradient(circle at top right, rgba(139, 92, 246, 0.4), transparent 70%)'
        }}
      />

      <div className="relative space-y-3">
        <div className="flex items-center gap-2">
          <div className="flex-shrink-0 w-1 h-12 bg-gradient-to-b from-[#8B5CF6] to-transparent rounded-full" />
          <div>
            <h3
              className="text-[11px] font-bold font-orbitron uppercase text-[#8B5CF6] dark:text-[#A78BFA]"
              style={{ letterSpacing: '1.5px' }}
            >
              📜 DAILY STOIC WISDOM
            </h3>
          </div>
        </div>

        <blockquote className="pl-5 space-y-2">
          <p className="text-[15px] leading-relaxed dark:text-[#E0E0E0] text-[#1A1A1A] font-medium italic">
            &ldquo;{todayQuote.text}&rdquo;
          </p>
          <footer className="text-sm dark:text-[#888888] text-[#666666] font-orbitron">
            — {todayQuote.author}
          </footer>
        </blockquote>
      </div>
    </div>
  );
}
