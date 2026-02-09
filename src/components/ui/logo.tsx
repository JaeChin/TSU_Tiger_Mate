import { cn } from "@/lib/utils";

const sizes = {
  sm: {
    mark: "h-8 w-8 text-sm",
    name: "text-lg",
    subtitle: "text-[10px]",
  },
  md: {
    mark: "h-10 w-10 text-base",
    name: "text-xl",
    subtitle: "text-xs",
  },
  lg: {
    mark: "h-14 w-14 text-xl",
    name: "text-3xl",
    subtitle: "text-sm",
  },
} as const;

type LogoSize = keyof typeof sizes;

interface LogoProps {
  size?: LogoSize;
  showText?: boolean;
  className?: string;
}

export function Logo({ size = "md", showText = true, className }: LogoProps) {
  const s = sizes[size];

  return (
    <span className={cn("inline-flex items-center gap-2.5", className)} aria-label="Tiger M.A.T.E">
      {/* TM Mark */}
      <span
        className={cn(
          "inline-flex items-center justify-center rounded-xl bg-maroon-900 font-display font-bold text-gold-500 shrink-0",
          s.mark
        )}
        aria-hidden="true"
      >
        TM
      </span>

      {showText && (
        <span className="flex flex-col leading-none">
          <span className={cn("font-display font-bold text-maroon-900 tracking-tight", s.name)}>
            Tiger M.A.T.E
          </span>
          <span className={cn("text-surface-500 font-body", s.subtitle)}>
            My Academic Transition Experience
          </span>
        </span>
      )}
    </span>
  );
}
