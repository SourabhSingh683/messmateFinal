
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/context/ThemeContext";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

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
            className="h-9 w-9 rounded-full transition-all duration-500 
                      bg-[#FDF6E3] border-[#C4A484]/30 
                      hover:bg-[#E9DBC5] hover:scale-110
                      dark:bg-[#3A1E0C] dark:border-[#8B4513] dark:hover:bg-[#4A2E1C]
                      shadow-sm hover:shadow-md"
            aria-label="Toggle theme"
          >
            {theme === "light" ? (
              <Sun className="h-4 w-4 text-[#8B4513] rotate-0 scale-100 transition-all duration-500" />
            ) : (
              <Moon className="h-4 w-4 text-[#FDF6E3] rotate-90 scale-100 transition-all duration-500" />
            )}
            <span className="sr-only">Toggle theme</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" 
          className="bg-white/90 backdrop-blur-sm text-[#5C2C0C] border-[#8B4513]/20
                    dark:bg-[#3A1E0C]/90 dark:text-[#FDF6E3] dark:border-[#8B4513]/50 
                    animate-fade-in"
        >
          <p>Switch to {theme === "light" ? "dark" : "light"} mode</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
