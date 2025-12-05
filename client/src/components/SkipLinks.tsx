export function SkipLinks() {
  return (
    <div className="sr-only focus-within:not-sr-only">
      <a
        href="#main-content"
        className="skip-link absolute top-0 left-0 z-[9999] bg-primary text-primary-foreground px-4 py-2 font-medium focus:not-sr-only focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        data-testid="skip-to-main"
      >
        Skip to main content
      </a>
      <a
        href="#main-navigation"
        className="skip-link absolute top-0 left-32 z-[9999] bg-primary text-primary-foreground px-4 py-2 font-medium focus:not-sr-only focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        data-testid="skip-to-nav"
      >
        Skip to navigation
      </a>
    </div>
  );
}
