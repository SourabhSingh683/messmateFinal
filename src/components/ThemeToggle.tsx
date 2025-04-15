
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
            className="h-9 w-9 rounded-md transition-all duration-300 
                      bg-[#FDF6E3] border-[#C4A484]/30 
                      hover:bg-[#E9DBC5] hover:scale-105
                      dark:bg-[#5C2C0C] dark:border-[#8B4513] dark:hover:bg-[#7A3C13]"
          >
            {theme === "light" ? (
              <Sun className="h-5 w-5 text-[#8B4513] transition-all" />
            ) : (
              <Moon className="h-5 w-5 text-[#FDF6E3] transition-all" />
            )}
            <span className="sr-only">Toggle theme</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="dark:bg-[#3A1E0C] dark:text-[#FDF6E3] dark:border-[#8B4513]/50">
          <p>Switch to {theme === "light" ? "dark" : "light"} mode</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
