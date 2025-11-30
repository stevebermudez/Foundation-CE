import { loadUnit } from "./api.js";
import { renderLesson, renderQuiz } from "./ui.js";

export function initRouter(course) {
  window.addEventListener("hashchange", () => {
    handleRoute(course);
  });

  // Initial route
  if (!window.location.hash) {
    const firstUnit = course.units[0];
    const firstLesson = firstUnit.lessons[0];
    window.location.hash = `#/${firstUnit.id}/${firstLesson.id}`;
  } else {
    handleRoute(course);
  }
}

async function handleRoute(course) {
  try {
    const hash = window.location.hash.slice(2); // remove "#/"
    const [unitId, viewId] = hash.split("/");

    const unitMeta = course.units.find(u => u.id === unitId);
    if (!unitMeta) {
      console.warn("Unit not found:", unitId);
      return;
    }

    const unitData = await loadUnit(unitId);

    if (viewId === "quiz") {
      renderQuiz(unitMeta, unitData);
    } else {
      const lessonMeta = unitMeta.lessons.find(l => l.id === viewId);
      if (!lessonMeta) {
        console.warn("Lesson not found:", viewId);
        return;
      }
      renderLesson(unitMeta, lessonMeta, unitData, course);
    }
  } catch (err) {
    console.error("Route error:", err);
    document.getElementById("content").innerHTML = `<p>Error loading content: ${err.message}</p>`;
  }
}
