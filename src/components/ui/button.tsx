import * as React from "react"
import { cn } from "@/src/lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | "soft" | "gold" | "forest" | "teal-outline";
  size?: "default" | "sm" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none",
          {
            "bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs": variant === "default",
            "bg-rose-600 text-white hover:bg-rose-700 shadow-xs": variant === "destructive",
            "border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white": variant === "outline",
            "bg-emerald-100 text-emerald-900 hover:bg-emerald-200 dark:bg-emerald-950 dark:text-emerald-300": variant === "secondary",
            "bg-emerald-50 text-emerald-700 border border-emerald-500/20 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300": variant === "soft",
            "hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white": variant === "ghost",
            "text-emerald-600 underline-offset-4 hover:underline": variant === "link",
            "bg-gradient-to-r from-[#FFB800] to-[#E67E00] hover:from-[#FFA500] hover:to-[#D97000] text-slate-950 font-bold shadow-[0_4px_16px_rgba(245,158,11,0.25)] border-none hover:scale-[1.02] active:scale-[0.98]": variant === "gold",
            "bg-[#032C24] hover:bg-[#064237] text-white font-bold shadow-xs": variant === "forest",
            "bg-[#064237]/80 hover:bg-[#085244] text-emerald-100 border border-[#0F5C4E] font-medium transition-all shadow-xs": variant === "teal-outline",
            "h-10 px-4 py-2 text-sm": size === "default",
            "h-9 rounded-lg px-3 text-xs": size === "sm",
            "h-11 px-6 text-base": size === "lg",
            "h-10 w-10": size === "icon",
          },
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
