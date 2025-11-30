import { loadCourseConfig } from "./api.js";
import { initState } from "./state.js";
import { buildLayout, renderSidebar } from "./ui.js";
import { initRouter } from "./router.js";

async function main() {
  try {
    const course = await loadCourseConfig();
    initState(course);
    buildLayout(course);
    renderSidebar(course);
    initRouter(course);
  } catch (err) {
    console.error("Failed to initialize app:", err);
    document.body.innerHTML = `<div style="padding: 2rem; color: red;"><h1>Error</h1><p>${err.message}</p></div>`;
  }
}

main();
