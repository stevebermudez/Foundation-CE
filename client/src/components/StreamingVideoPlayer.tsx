import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  Download,
  Clock,
  BookOpen,
  Settings,
  AlertCircle,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Lesson {
  id: string;
  title: string;
  duration: string;
  completed: boolean;
}

interface StreamingVideoPlayerProps {
  courseTitle: string;
  currentLesson: Lesson;
  lessons: Lesson[];
  videoUrl?: string;
  hlsUrl?: string;
  onLessonSelect: (lessonId: string) => void;
  onComplete: () => void;
  onDownloadPdf: () => void;
}

export default function StreamingVideoPlayer({
  courseTitle,
  currentLesson,
  lessons,
  videoUrl,
  hlsUrl,
  onLessonSelect,
  onComplete,
  onDownloadPdf,
}: StreamingVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState("0:00");
  const [duration, setDuration] = useState("0:00");
  const [volume, setVolume] = useState(100);
  const [quality, setQuality] = useState("auto");
  const [buffered, setBuffered] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [playbackRate, setPlaybackRate] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentLessonIndex = lessons.findIndex((l) => l.id === currentLesson.id);
  const completedLessons = lessons.filter((l) => l.completed).length;
  const overallProgress = Math.round((completedLessons / lessons.length) * 100);

  // Format time helper
  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Handle video metadata
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      setDuration(formatTime(video.duration));
      setError(null);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(formatTime(video.currentTime));
      setProgress((video.currentTime / video.duration) * 100);
      
      // Auto-mark as complete at 95%
      if (video.currentTime / video.duration > 0.95 && !currentLesson.completed) {
        onComplete();
      }
    };

    const handleProgress = () => {
      if (video.buffered.length > 0) {
        setBuffered((video.buffered.end(video.buffered.length - 1) / video.duration) * 100);
      }
    };

    const handlePlay = () => {
      setIsPlaying(true);
      setIsLoading(false);
    };

    const handlePause = () => setIsPlaying(false);
    const handlePlaying = () => setIsLoading(false);
    const handleWaiting = () => setIsLoading(true);
    const handleError = () => {
      setError("Failed to load video. Please check your connection.");
      setIsLoading(false);
    };

    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("progress", handleProgress);
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("playing", handlePlaying);
    video.addEventListener("waiting", handleWaiting);
    video.addEventListener("error", handleError);

    return () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("progress", handleProgress);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("playing", handlePlaying);
      video.removeEventListener("waiting", handleWaiting);
      video.removeEventListener("error", handleError);
    };
  }, [currentLesson, onComplete]);

  // Handle fullscreen
  const toggleFullscreen = () => {
    if (containerRef.current) {
      if (!isFullscreen) {
        containerRef.current.requestFullscreen?.();
        setIsFullscreen(true);
      } else {
        document.exitFullscreen?.();
        setIsFullscreen(false);
      }
    }
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!videoRef.current) return;
      
      switch (e.code) {
        case "Space":
          e.preventDefault();
          videoRef.current.paused ? videoRef.current.play() : videoRef.current.pause();
          break;
        case "ArrowLeft":
          videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 5);
          break;
        case "ArrowRight":
          videoRef.current.currentTime = Math.min(videoRef.current.duration, videoRef.current.currentTime + 5);
          break;
        case "KeyF":
          toggleFullscreen();
          break;
        case "KeyM":
          setIsMuted(!isMuted);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isFullscreen, isMuted]);

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <div className="flex-1">
        <Card className="overflow-hidden" ref={containerRef}>
          <div className="relative w-full bg-black">
            <div className="relative aspect-video bg-black flex items-center justify-center">
              {error ? (
                <div className="absolute inset-0 flex items-center justify-center bg-red-900/20">
                  <div className="text-center text-white">
                    <AlertCircle className="h-16 w-16 mx-auto mb-4" />
                    <p className="text-lg">{error}</p>
                  </div>
                </div>
              ) : isLoading ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white/50">
                    <div className="animate-spin">
                      <BookOpen className="h-16 w-16 mx-auto mb-4" />
                    </div>
                    <p className="text-lg">Loading video...</p>
                  </div>
                </div>
              ) : null}

              <video
                ref={videoRef}
                className="w-full h-full"
                onClick={() => videoRef.current && (videoRef.current.paused ? videoRef.current.play() : videoRef.current.pause())}
                controlsList="nodownload"
              >
                {hlsUrl && (
                  <source src={hlsUrl} type="application/x-mpegURL" />
                )}
                {videoUrl && (
                  <source src={videoUrl} type="video/mp4" />
                )}
                Your browser doesn't support HTML5 video.
              </video>

              {/* Video Controls Overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 hover:opacity-100 transition-opacity">
                <div className="mb-3">
                  <Progress value={progress} className="h-1 cursor-pointer" onClick={(e) => {
                    if (videoRef.current && e.currentTarget.offsetWidth) {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const clickX = e.clientX - rect.left;
                      const percentage = clickX / rect.width;
                      videoRef.current.currentTime = percentage * videoRef.current.duration;
                    }
                  }} />
                  <div className="h-1 bg-white/30 rounded absolute bottom-4 left-4 right-4 opacity-50" style={{width: `${buffered}%`}} />
                </div>

                <div className="flex items-center justify-between gap-2 flex-wrap">
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
                      onClick={() => videoRef.current && (videoRef.current.paused ? videoRef.current.play() : videoRef.current.pause())}
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

                    <div className="flex items-center gap-2">
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
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={volume}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setVolume(val);
                          if (videoRef.current) videoRef.current.volume = val / 100;
                        }}
                        className="w-16 h-1"
                      />
                    </div>

                    <span className="text-white text-sm">
                      {currentTime} / {duration}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Select value={playbackRate.toString()} onValueChange={(v) => {
                      const rate = parseFloat(v);
                      setPlaybackRate(rate);
                      if (videoRef.current) videoRef.current.playbackRate = rate;
                    }}>
                      <SelectTrigger className="w-20 h-8 text-white bg-black/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0.5">0.5x</SelectItem>
                        <SelectItem value="1">1x</SelectItem>
                        <SelectItem value="1.25">1.25x</SelectItem>
                        <SelectItem value="1.5">1.5x</SelectItem>
                        <SelectItem value="2">2x</SelectItem>
                      </SelectContent>
                    </Select>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-white hover:bg-white/20"
                      onClick={toggleFullscreen}
                      data-testid="button-fullscreen"
                    >
                      <Maximize className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
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
              onClick={onComplete}
              disabled={currentLesson.completed}
              data-testid="button-mark-complete"
            >
              {currentLesson.completed ? "Completed" : "Mark Complete"}
            </Button>
          </div>
        </div>
      </div>

      {/* Lessons Sidebar */}
      <div className="w-full lg:w-80">
        <Card className="h-full flex flex-col">
          <div className="p-4 border-b">
            <h3 className="font-semibold">Course Lessons</h3>
            <p className="text-sm text-muted-foreground">{overallProgress}% complete</p>
          </div>
          <ScrollArea className="flex-1">
            <div className="space-y-2 p-4">
              {lessons.map((lesson, idx) => (
                <div
                  key={lesson.id}
                  onClick={() => onLessonSelect(lesson.id)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    currentLesson.id === lesson.id
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  }`}
                  data-testid={`lesson-${idx}`}
                >
                  <div className="flex items-start gap-3">
                    {lesson.completed ? (
                      <CheckCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                    ) : (
                      <Circle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm line-clamp-2">{lesson.title}</p>
                      <p className="text-xs opacity-75 flex items-center gap-1 mt-1">
                        <Clock className="h-3 w-3" />
                        {lesson.duration}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </Card>
      </div>
    </div>
  );
}
