import { saveQuizResult, getUnitProgress } from "./state.js";

export function buildQuizElement(unitMeta, unitData) {
  const quiz = unitData.quiz;
  const wrapper = document.createElement("div");
  wrapper.className = "quiz-wrapper";

  const form = document.createElement("form");
  form.id = "quiz-form";

  quiz.questions.forEach((q, idx) => {
    const card = document.createElement("div");
    card.className = "quiz-card";

    const prompt = document.createElement("p");
    prompt.textContent = `${idx + 1}. ${q.prompt}`;
    card.appendChild(prompt);

    q.choices.forEach((choice, i) => {
      const label = document.createElement("label");
      label.className = "quiz-choice";
      
      const input = document.createElement("input");
      input.type = "radio";
      input.name = q.id;
      input.value = i;
      
      const text = document.createElement("span");
      text.textContent = choice;
      
      label.appendChild(input);
      label.appendChild(text);
      card.appendChild(label);
    });

    form.appendChild(card);
  });

  wrapper.appendChild(form);

  const button = document.createElement("button");
  button.type = "button";
  button.className = "quiz-submit";
  button.textContent = "Submit Quiz";
  button.addEventListener("click", () => {
    const { correct, total, percent } = gradeQuiz(quiz, form);
    const passing = unitMeta.passingScore || 70;
    saveQuizResult(unitMeta.id, percent, passing);
    showQuizResult(wrapper, form, correct, total, percent, passing, unitMeta);
  });

  wrapper.appendChild(button);
  return wrapper;
}

function gradeQuiz(quiz, form) {
  let correct = 0;
  const answers = new FormData(form);
  
  quiz.questions.forEach(q => {
    const selected = answers.get(q.id);
    if (selected !== null && parseInt(selected) === q.answerIndex) {
      correct++;
    }
  });
  
  const total = quiz.questions.length;
  const percent = Math.round((correct / total) * 100);
  
  return { correct, total, percent };
}

function showQuizResult(wrapper, form, correct, total, percent, passing, unitMeta) {
  form.style.display = "none";
  
  const resultDiv = document.createElement("div");
  resultDiv.className = `quiz-result ${percent >= passing ? "pass" : "fail"}`;
  
  const h3 = document.createElement("h3");
  h3.textContent = percent >= passing ? "🎉 Quiz Passed!" : "Quiz Not Passed";
  resultDiv.appendChild(h3);
  
  const scoreP = document.createElement("p");
  scoreP.textContent = `You scored ${correct} out of ${total} (${percent}%)`;
  resultDiv.appendChild(scoreP);
  
  const requiredP = document.createElement("p");
  requiredP.textContent = `Passing score: ${passing}%`;
  requiredP.style.fontSize = "0.9rem";
  requiredP.style.color = "#666";
  resultDiv.appendChild(requiredP);
  
  if (percent >= passing) {
    const nextBtn = document.createElement("button");
    nextBtn.textContent = "Continue to Next Unit";
    nextBtn.style.marginTop = "1rem";
    nextBtn.onclick = () => {
      // Could navigate to next unit
    };
    resultDiv.appendChild(nextBtn);
  } else {
    const retryBtn = document.createElement("button");
    retryBtn.textContent = "Try Again";
    retryBtn.className = "outline";
    retryBtn.style.marginTop = "1rem";
    retryBtn.onclick = () => {
      form.style.display = "block";
      resultDiv.remove();
      // Reset form
      Array.from(form.querySelectorAll("input")).forEach(i => i.checked = false);
    };
    resultDiv.appendChild(retryBtn);
  }
  
  wrapper.appendChild(resultDiv);
}
