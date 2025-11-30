import { useState } from "react";
import Header from "../Header";
import { ThemeProvider } from "../ThemeProvider";

export default function HeaderExample() {
  const [selectedState, setSelectedState] = useState<"CA" | "FL">("CA");

  return (
    <ThemeProvider>
      <Header
        selectedState={selectedState}
        onStateChange={setSelectedState}
      />
    </ThemeProvider>
  );
}
