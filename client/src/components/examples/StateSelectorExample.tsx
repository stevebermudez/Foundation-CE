import StateSelector from "../StateSelector";
import { ThemeProvider } from "../ThemeProvider";

export default function StateSelectorExample() {
  return (
    <ThemeProvider>
      <StateSelector onSelectState={(state) => console.log("Selected state:", state)} />
    </ThemeProvider>
  );
}
