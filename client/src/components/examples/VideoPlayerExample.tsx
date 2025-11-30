import { useState } from "react";
import VideoPlayer from "../VideoPlayer";
import { ThemeProvider } from "../ThemeProvider";

const lessons = [
  { id: "1", title: "Introduction to Real Estate Ethics", duration: "8:30", completed: true },
  { id: "2", title: "Fiduciary Duties Explained", duration: "12:45", completed: true },
  { id: "3", title: "Disclosure Requirements", duration: "15:20", completed: false },
  { id: "4", title: "Professional Standards", duration: "10:15", completed: false },
  { id: "5", title: "Case Studies and Examples", duration: "18:30", completed: false },
];

export default function VideoPlayerExample() {
  const [currentLesson, setCurrentLesson] = useState(lessons[2]);

  return (
    <ThemeProvider>
      <div className="p-4">
        <VideoPlayer
          courseTitle="California Real Estate Ethics"
          currentLesson={currentLesson}
          lessons={lessons}
          onLessonSelect={(id) => {
            const lesson = lessons.find(l => l.id === id);
            if (lesson) setCurrentLesson(lesson);
          }}
          onComplete={() => console.log("Lesson completed")}
          onDownloadPdf={() => console.log("Download PDF")}
        />
      </div>
    </ThemeProvider>
  );
}
