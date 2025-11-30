const STORAGE_KEY = "foundationce_fl_sa63_progress";

let state = {
  courseId: null,
  units: {} // unitId -> { completedLessons: [], quizScore: null, quizPassed: false }
};

export function initState(course) {
  state.courseId = course.courseId;
  const saved = localStorage.getItem(STORAGE_KEY);

  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (parsed.courseId === course.courseId) {
        state = parsed;
        return;
      }
    } catch {}
  }

  course.units.forEach(u => {
    state.units[u.id] = {
      completedLessons: [],
      quizScore: null,
      quizPassed: false
    };
  });

  persist();
}

export function markLessonComplete(unitId, lessonId) {
  const u = state.units[unitId];
  if (u && !u.completedLessons.includes(lessonId)) {
    u.completedLessons.push(lessonId);
    persist();
  }
}

export function saveQuizResult(unitId, percent, passingScore) {
  const u = state.units[unitId];
  if (u) {
    u.quizScore = percent;
    u.quizPassed = percent >= passingScore;
    persist();
  }
}

export function getUnitProgress(unitId) {
  return state.units[unitId];
}

export function getOverallProgress(course) {
  let completedLessons = 0;
  let passedQuizzes = 0;
  
  Object.values(state.units).forEach(u => {
    completedLessons += u.completedLessons.length;
    if (u.quizPassed) passedQuizzes++;
  });
  
  const totalLessons = course.units.reduce((sum, u) => sum + (u.lessons?.length || 0), 0);
  const totalQuizzes = course.units.filter(u => u.hasQuiz).length;
  
  return {
    completedLessons,
    totalLessons,
    passedQuizzes,
    totalQuizzes
  };
}

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
