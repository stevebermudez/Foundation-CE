import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Clock, BookOpen, PlayCircle, Timer, TimerOff, Award } from "lucide-react";

export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  category: string;
  ceHours: number;
  state: "CA" | "FL";
  profession: "real_estate" | "insurance";
  timedOption: boolean;
  untimedOption: boolean;
  duration: string;
  lessons: number;
  enrolled?: boolean;
  progress?: number;
  completed?: boolean;
}

interface CourseCardProps {
  course: Course;
  onEnroll: (courseId: string) => void;
  onContinue: (courseId: string) => void;
}

export default function CourseCard({ course, onEnroll, onContinue }: CourseCardProps) {
  const getProfessionLabel = () => {
    return course.profession === "real_estate" ? "Real Estate" : "Insurance";
  };

  const getStateLabel = () => {
    return course.state === "CA" ? "California" : "Florida";
  };

  return (
    <Card className="overflow-hidden flex flex-col h-full hover-elevate" data-testid={`card-course-${course.id}`}>
      <div className="relative aspect-video overflow-hidden">
        <img
          src={course.thumbnail}
          alt={course.title}
          className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
        />
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <Badge variant="secondary" className="bg-background/90 backdrop-blur text-xs">
            {course.state}
          </Badge>
          <Badge variant="secondary" className="bg-background/90 backdrop-blur text-xs">
            {getProfessionLabel()}
          </Badge>
        </div>
        {course.completed && (
          <div className="absolute top-3 right-3">
            <Badge className="bg-green-600 text-white gap-1">
              <Award className="h-3 w-3" />
              Completed
            </Badge>
          </div>
        )}
      </div>

      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2 mb-2">
          <Badge variant="outline" className="text-xs">
            {course.category}
          </Badge>
          <Badge variant="secondary" className="gap-1 text-xs">
            <Clock className="h-3 w-3" />
            {course.ceHours} CE Hours
          </Badge>
        </div>
        <h3 className="font-semibold text-base leading-tight line-clamp-2" data-testid={`text-course-title-${course.id}`}>
          {course.title}
        </h3>
      </CardHeader>

      <CardContent className="pb-3 flex-1">
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {course.description}
        </p>
        
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <PlayCircle className="h-4 w-4" />
            <span>{course.duration}</span>
          </div>
          <div className="flex items-center gap-1">
            <BookOpen className="h-4 w-4" />
            <span>{course.lessons} lessons</span>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-3">
          {course.untimedOption && (
            <Badge variant="outline" className="gap-1 text-xs text-green-600 border-green-200 dark:border-green-900">
              <TimerOff className="h-3 w-3" />
              No Timer
            </Badge>
          )}
          {course.timedOption && (
            <Badge variant="outline" className="gap-1 text-xs">
              <Timer className="h-3 w-3" />
              Timed
            </Badge>
          )}
        </div>

        {course.enrolled && course.progress !== undefined && !course.completed && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-muted-foreground">Progress</span>
              <span className="text-xs font-medium">{course.progress}%</span>
            </div>
            <Progress value={course.progress} className="h-1.5" />
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-0">
        {course.enrolled ? (
          <Button 
            className="w-full" 
            onClick={() => onContinue(course.id)}
            data-testid={`button-continue-${course.id}`}
          >
            {course.completed ? "Review Course" : "Continue Learning"}
          </Button>
        ) : (
          <Button 
            className="w-full" 
            onClick={() => onEnroll(course.id)}
            data-testid={`button-enroll-${course.id}`}
          >
            Enroll Now
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
