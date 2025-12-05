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
    
    const errorContainer = document.createElement('div');
    errorContainer.style.padding = '2rem';
    errorContainer.style.color = 'red';
    
    const heading = document.createElement('h1');
    heading.textContent = 'Error';
    
    const message = document.createElement('p');
    message.textContent = err.message;
    
    errorContainer.appendChild(heading);
    errorContainer.appendChild(message);
    document.body.innerHTML = '';
    document.body.appendChild(errorContainer);
  }
}

main();
