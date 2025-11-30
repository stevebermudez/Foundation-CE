import Hero from "../Hero";
import { ThemeProvider } from "../ThemeProvider";

export default function HeroExample() {
  return (
    <ThemeProvider>
      <Hero
        onBrowseCourses={() => console.log("Browse courses clicked")}
        onGetStarted={() => console.log("Get started clicked")}
      />
    </ThemeProvider>
  );
}
