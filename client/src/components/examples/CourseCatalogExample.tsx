import CourseCatalog from "../CourseCatalog";
import { ThemeProvider } from "../ThemeProvider";

export default function CourseCatalogExample() {
  return (
    <ThemeProvider>
      <CourseCatalog selectedState="CA" />
    </ThemeProvider>
  );
}
