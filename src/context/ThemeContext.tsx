
import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

interface ThemeContextProps {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextProps>({
  theme: "light",
  toggleTheme: () => {},
  setTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    // Check local storage or system preference for initial theme
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem("theme") as Theme;
      
      if (savedTheme) {
        return savedTheme;
      }
      
      // Check for system preference
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return "dark";
      }
    }
    
    // Default to light theme
    return "light";
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem("theme", theme);
      
      // Add or remove dark class on document element
      if (theme === "dark") {
        document.documentElement.classList.add("dark");
        document.documentElement.style.colorScheme = "dark";
      } else {
        document.documentElement.classList.remove("dark");
        document.documentElement.style.colorScheme = "light";
      }
      
      // Update meta theme-color for mobile devices
      const metaThemeColor = document.querySelector("meta[name='theme-color']");
      if (metaThemeColor) {
        metaThemeColor.setAttribute(
          "content", 
          theme === "dark" ? "#1a0f06" : "#FDF6E3"
        );
      }
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
