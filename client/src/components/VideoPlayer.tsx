import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  SkipBack,
  SkipForward,
  CheckCircle,
  Circle,
  FileText,
  Download,
  Clock,
  BookOpen,
} from "lucide-react";

interface Lesson {
  id: string;
  title: string;
  duration: string;
  completed: boolean;
}

interface VideoPlayerProps {
  courseTitle: string;
  currentLesson: Lesson;
  lessons: Lesson[];
  videoUrl?: string;
  onLessonSelect: (lessonId: string) => void;
  onComplete: () => void;
  onDownloadPdf: () => void;
}

export default function VideoPlayer({
  courseTitle,
  currentLesson,
  lessons,
  onLessonSelect,
  onComplete,
  onDownloadPdf,
}: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(35);
  const [currentTime, setCurrentTime] = useState("12:45");
  const totalTime = "36:20";

  const currentLessonIndex = lessons.findIndex((l) => l.id === currentLesson.id);
  const completedLessons = lessons.filter((l) => l.completed).length;
  const overallProgress = Math.round((completedLessons / lessons.length) * 100);

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <div className="flex-1">
        <Card className="overflow-hidden">
          <div className="relative aspect-video bg-black flex items-center justify-center">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white/50">
                <BookOpen className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">Video content for</p>
                <p className="font-semibold">{currentLesson.title}</p>
              </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
              <div className="mb-3">
                <Progress value={progress} className="h-1 cursor-pointer" />
              </div>

              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20"
                    onClick={() => {
                      if (currentLessonIndex > 0) {
                        onLessonSelect(lessons[currentLessonIndex - 1].id);
                      }
                    }}
                    disabled={currentLessonIndex === 0}
                    data-testid="button-previous-lesson"
                  >
                    <SkipBack className="h-4 w-4" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20 h-10 w-10"
                    onClick={() => setIsPlaying(!isPlaying)}
                    data-testid="button-play-pause"
                  >
                    {isPlaying ? (
                      <Pause className="h-5 w-5" />
                    ) : (
                      <Play className="h-5 w-5" />
                    )}
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20"
                    onClick={() => {
                      if (currentLessonIndex < lessons.length - 1) {
                        onLessonSelect(lessons[currentLessonIndex + 1].id);
                      }
                    }}
                    disabled={currentLessonIndex === lessons.length - 1}
                    data-testid="button-next-lesson"
                  >
                    <SkipForward className="h-4 w-4" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/20"
                    onClick={() => setIsMuted(!isMuted)}
                    data-testid="button-mute"
                  >
                    {isMuted ? (
                      <VolumeX className="h-4 w-4" />
                    ) : (
                      <Volume2 className="h-4 w-4" />
                    )}
                  </Button>

                  <span className="text-white text-sm">
                    {currentTime} / {totalTime}
                  </span>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20"
                  data-testid="button-fullscreen"
                >
                  <Maximize className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </Card>

        <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold" data-testid="text-lesson-title">
              {currentLesson.title}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Lesson {currentLessonIndex + 1} of {lessons.length} • {currentLesson.duration}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="gap-2"
              onClick={onDownloadPdf}
              data-testid="button-download-pdf"
            >
              <Download className="h-4 w-4" />
              Download PDF Guide
            </Button>
            <Button
              className="gap-2"
              onClick={onComplete}
              data-testid="button-mark-complete"
            >
              <CheckCircle className="h-4 w-4" />
              Mark Complete
            </Button>
          </div>
        </div>
      </div>

      <aside className="w-full lg:w-80 shrink-0">
        <Card className="overflow-hidden">
          <div className="p-4 border-b">
            <h3 className="font-semibold mb-1">{courseTitle}</h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{completedLessons}/{lessons.length} lessons completed</span>
            </div>
            <Progress value={overallProgress} className="mt-2 h-1.5" />
          </div>

          <ScrollArea className="h-96">
            <div className="p-2">
              {lessons.map((lesson, index) => (
                <button
                  key={lesson.id}
                  onClick={() => onLessonSelect(lesson.id)}
                  className={`w-full flex items-start gap-3 p-3 rounded-md text-left transition-colors hover-elevate ${
                    lesson.id === currentLesson.id
                      ? "bg-accent"
                      : ""
                  }`}
                  data-testid={`button-lesson-${lesson.id}`}
                >
                  <div className="mt-0.5">
                    {lesson.completed ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : lesson.id === currentLesson.id ? (
                      <Play className="h-4 w-4 text-primary" />
                    ) : (
                      <Circle className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm font-medium leading-tight ${
                        lesson.completed ? "text-muted-foreground" : ""
                      }`}
                    >
                      {index + 1}. {lesson.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {lesson.duration}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>

          <div className="p-4 border-t">
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={onDownloadPdf}
              data-testid="button-download-full-guide"
            >
              <FileText className="h-4 w-4" />
              Download Full Course Guide (PDF)
            </Button>
          </div>
        </Card>
      </aside>
    </div>
  );
}
