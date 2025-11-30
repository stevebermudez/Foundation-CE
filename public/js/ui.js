import { markLessonComplete, getUnitProgress, getOverallProgress } from "./state.js";
import { buildQuizElement } from "./quiz.js";

const contentEl = document.getElementById("content");
const sidebarEl = document.getElementById("sidebar");
const titleEl = document.getElementById("course-title");
const progressEl = document.getElementById("header-progress");

export function buildLayout(course) {
  titleEl.textContent = course.title;
  updateProgress(course);
}

export function updateProgress(course) {
  const prog = getOverallProgress(course);
  const percent = course.units.length > 0 
    ? Math.round((prog.passedQuizzes / course.units.filter(u => u.hasQuiz).length) * 100) || 0
    : 0;
  progressEl.textContent = `${prog.passedQuizzes}/${prog.totalQuizzes} quizzes passed (${percent}%)`;
}

export function renderSidebar(course) {
  sidebarEl.innerHTML = "";
  
  course.units.forEach((unit, unitIdx) => {
    const unitDiv = document.createElement("div");
    unitDiv.className = "sidebar-unit";

    const header = document.createElement("div");
    header.className = "sidebar-unit-title";
    header.textContent = `Unit ${unit.number}: ${unit.title}`;
    unitDiv.appendChild(header);

    const list = document.createElement("ul");
    
    unit.lessons.forEach((lesson, lessonIdx) => {
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.textContent = lesson.title;
      a.href = `#/${unit.id}/${lesson.id}`;
      
      const currentHash = window.location.hash.slice(2);
      if (currentHash === `${unit.id}/${lesson.id}`) {
        a.classList.add("active");
      }
      
      li.appendChild(a);
      list.appendChild(li);
    });

    if (unit.hasQuiz) {
      const quizLi = document.createElement("li");
      const quizLink = document.createElement("a");
      quizLink.className = "quiz";
      quizLink.textContent = "Unit Quiz";
      quizLink.href = `#/${unit.id}/quiz`;
      
      const currentHash = window.location.hash.slice(2);
      if (currentHash === `${unit.id}/quiz`) {
        quizLink.classList.add("active");
      }
      
      const prog = getUnitProgress(unit.id);
      if (prog && prog.quizPassed) {
        quizLink.textContent = "✓ Unit Quiz (Passed)";
      }
      
      quizLi.appendChild(quizLink);
      list.appendChild(quizLi);
    }

    unitDiv.appendChild(list);
    sidebarEl.appendChild(unitDiv);
  });
}

export function renderLesson(unitMeta, lessonMeta, unitData, course) {
  const lessonFull = unitData.lessons.find(l => l.id === lessonMeta.id);
  if (!lessonFull) return;

  markLessonComplete(unitMeta.id, lessonMeta.id);
  updateProgress(course);

  contentEl.innerHTML = "";

  const header = document.createElement("div");
  header.className = "lesson-header";
  
  const titleDiv = document.createElement("div");
  titleDiv.innerHTML = `<h1>Unit ${unitMeta.number}: ${unitMeta.title}</h1><p>${lessonMeta.title}</p>`;
  header.appendChild(titleDiv);

  const navDiv = document.createElement("div");
  navDiv.className = "lesson-nav";
  
  const unitIdx = course.units.findIndex(u => u.id === unitMeta.id);
  const lessonIdx = unitMeta.lessons.findIndex(l => l.id === lessonMeta.id);
  
  // Previous button
  const prevBtn = document.createElement("button");
  if (lessonIdx > 0) {
    prevBtn.textContent = "← Previous";
    const prevLesson = unitMeta.lessons[lessonIdx - 1];
    prevBtn.onclick = () => { window.location.hash = `#/${unitMeta.id}/${prevLesson.id}`; };
  } else if (unitIdx > 0) {
    prevBtn.textContent = "← Previous";
    const prevUnit = course.units[unitIdx - 1];
    const prevLesson = prevUnit.lessons[prevUnit.lessons.length - 1];
    prevBtn.onclick = () => { window.location.hash = `#/${prevUnit.id}/${prevLesson.id}`; };
  } else {
    prevBtn.disabled = true;
  }
  navDiv.appendChild(prevBtn);
  
  // Quiz button
  if (unitMeta.hasQuiz) {
    const quizBtn = document.createElement("button");
    quizBtn.textContent = "Take Quiz";
    quizBtn.onclick = () => { window.location.hash = `#/${unitMeta.id}/quiz`; };
    navDiv.appendChild(quizBtn);
  }
  
  // Next button
  const nextBtn = document.createElement("button");
  if (lessonIdx < unitMeta.lessons.length - 1) {
    nextBtn.textContent = "Next →";
    const nextLesson = unitMeta.lessons[lessonIdx + 1];
    nextBtn.onclick = () => { window.location.hash = `#/${unitMeta.id}/${nextLesson.id}`; };
  } else if (unitIdx < course.units.length - 1) {
    nextBtn.textContent = "Next Unit →";
    const nextUnit = course.units[unitIdx + 1];
    const nextLesson = nextUnit.lessons[0];
    nextBtn.onclick = () => { window.location.hash = `#/${nextUnit.id}/${nextLesson.id}`; };
  } else {
    nextBtn.disabled = true;
  }
  navDiv.appendChild(nextBtn);
  
  header.appendChild(navDiv);
  contentEl.appendChild(header);

  const mainContent = document.createElement("div");
  mainContent.className = "lesson-content";
  
  if (lessonFull.onscreen) {
    lessonFull.onscreen.forEach(block => {
      renderBlock(block, mainContent);
    });
  }
  
  contentEl.appendChild(mainContent);
}

function renderBlock(block, container) {
  if (block.type === "heading") {
    const h2 = document.createElement("h2");
    h2.textContent = block.text;
    container.appendChild(h2);
  } else if (block.type === "list") {
    const ul = document.createElement("ul");
    block.items.forEach(item => {
      const li = document.createElement("li");
      li.textContent = item;
      ul.appendChild(li);
    });
    container.appendChild(ul);
  } else if (block.type === "columns") {
    const wrapper = document.createElement("div");
    wrapper.className = "columns-wrapper";
    block.columns.forEach(col => {
      const colDiv = document.createElement("div");
      colDiv.className = "column";
      const title = document.createElement("h3");
      title.textContent = col.title;
      colDiv.appendChild(title);
      const ul = document.createElement("ul");
      col.items.forEach(item => {
        const li = document.createElement("li");
        li.textContent = item;
        ul.appendChild(li);
      });
      colDiv.appendChild(ul);
      wrapper.appendChild(colDiv);
    });
    container.appendChild(wrapper);
  }
}

export function renderQuiz(unitMeta, unitData) {
  contentEl.innerHTML = "";
  
  const h1 = document.createElement("h1");
  h1.textContent = `Unit ${unitMeta.number} Quiz: ${unitMeta.title}`;
  contentEl.appendChild(h1);
  
  const quizEl = buildQuizElement(unitMeta, unitData);
  contentEl.appendChild(quizEl);
}
