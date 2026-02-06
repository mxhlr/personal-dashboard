"use client";

interface LogoProps {
  className?: string;
}

export function Logo({ className = "" }: LogoProps) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <svg
        width="32"
        height="32"
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="transition-all duration-200"
      >
        {/* First R */}
        <path
          d="M20 25 L20 75 M20 25 L40 25 Q50 25 50 35 Q50 45 40 45 L20 45 M40 45 L52 75"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="dark:text-[#00E5FF] text-[#0077B6]"
          style={{ filter: 'drop-shadow(0 0 4px currentColor)' }}
        />

        {/* Second R */}
        <path
          d="M60 25 L60 75 M60 25 L80 25 Q90 25 90 35 Q90 45 80 45 L60 45 M80 45 L92 75"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="dark:text-[#00E5FF] text-[#0077B6]"
          style={{ filter: 'drop-shadow(0 0 4px currentColor)' }}
        />
      </svg>
    </div>
  );
}
