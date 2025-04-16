
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/context/ThemeContext";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            onClick={toggleTheme}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            className={`
              h-10 w-10 rounded-full transition-all duration-500 
              relative overflow-hidden
              ${theme === 'light' 
                ? 'bg-amber-50 border-amber-200 hover:bg-amber-100' 
                : 'bg-indigo-950 border-indigo-800 hover:bg-indigo-900'
              }
              hover:scale-110 shadow-sm hover:shadow-md
            `}
            aria-label="Toggle theme"
          >
            <div 
              className={`
                absolute inset-0 transition-transform duration-700
                ${isHovering ? 'scale-110' : 'scale-100'}
                ${theme === 'light' 
                  ? 'bg-gradient-to-tr from-amber-50 to-amber-100' 
                  : 'bg-gradient-to-tr from-indigo-950 to-indigo-900'
                }
              `}
            />
            
            <div className="relative z-10">
              {theme === "light" ? (
                <Sun className={`
                  h-5 w-5 
                  ${isHovering ? 'text-amber-600 animate-spin' : 'text-amber-500'} 
                  transition-all duration-500 transform
                  ${isHovering ? 'rotate-45' : 'rotate-0'}
                `} />
              ) : (
                <Moon className={`
                  h-5 w-5 
                  ${isHovering ? 'text-indigo-300 animate-pulse' : 'text-indigo-400'} 
                  transition-all duration-500 transform
                  ${isHovering ? 'rotate-[270deg]' : 'rotate-90'}
                `} />
              )}
            </div>
            
            <span className="sr-only">Toggle theme</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" 
          className={`
            backdrop-blur-sm border animate-fade-in
            ${theme === 'light'
              ? 'bg-amber-50/90 text-amber-950 border-amber-200/50'
              : 'bg-indigo-950/90 text-indigo-200 border-indigo-800/50'
            }
          `}
        >
          <p>Switch to {theme === "light" ? "dark" : "light"} mode</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
