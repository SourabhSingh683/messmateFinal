
import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-muted dark:bg-muted/40 overflow-hidden relative", 
        "after:absolute after:inset-0 after:translate-x-[-100%] after:bg-gradient-to-r after:from-transparent after:via-white/5 after:to-transparent after:animate-[shimmer_2s_infinite]",
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }
