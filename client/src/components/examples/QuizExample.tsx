import QuizComponent from "../QuizComponent";
import { ThemeProvider } from "../ThemeProvider";

const questions = [
  {
    id: "1",
    question: "What is the primary fiduciary duty owed by a real estate agent to their client?",
    options: [
      "Obedience to all instructions",
      "Loyalty and putting client interests first",
      "Maintaining confidentiality only",
      "Providing accurate market analysis"
    ],
    correctAnswer: 1,
    explanation: "The primary fiduciary duty is loyalty, which means putting the client's interests above all others, including the agent's own interests."
  },
  {
    id: "2",
    question: "When must material facts be disclosed to a buyer?",
    options: [
      "Only when asked directly",
      "After the purchase agreement is signed",
      "As soon as the agent becomes aware of them",
      "Only for properties over $1 million"
    ],
    correctAnswer: 2,
    explanation: "Material facts must be disclosed as soon as the agent becomes aware of them, regardless of whether the buyer asks."
  },
  {
    id: "3",
    question: "Which of the following is NOT a protected class under fair housing laws?",
    options: [
      "Race",
      "Religion",
      "Income level",
      "Familial status"
    ],
    correctAnswer: 2,
    explanation: "Income level is not a protected class under federal fair housing laws. Protected classes include race, color, religion, national origin, sex, familial status, and disability."
  },
];

export default function QuizExample() {
  return (
    <ThemeProvider>
      <div className="p-4 bg-background min-h-screen">
        <QuizComponent
          courseTitle="California Real Estate Ethics"
          questions={questions}
          isTimed={false}
          passingScore={70}
          onComplete={(score, passed) => console.log(`Score: ${score}, Passed: ${passed}`)}
          onDownloadCertificate={() => console.log("Download certificate")}
        />
      </div>
    </ThemeProvider>
  );
}
