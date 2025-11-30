import CourseCard from "../CourseCard";
import { ThemeProvider } from "../ThemeProvider";
import caRealEstate from "@assets/generated_images/california_luxury_real_estate.png";

export default function CourseCardExample() {
  const course = {
    id: "1",
    title: "California Real Estate Ethics and Professional Conduct",
    description: "Comprehensive ethics training covering fiduciary duties, disclosure requirements, and professional standards.",
    thumbnail: caRealEstate,
    category: "Ethics",
    ceHours: 3,
    state: "CA" as const,
    profession: "real_estate" as const,
    timedOption: true,
    untimedOption: true,
    duration: "3h 30m",
    lessons: 12,
    enrolled: true,
    progress: 65,
  };

  return (
    <ThemeProvider>
      <div className="max-w-sm">
        <CourseCard
          course={course}
          onEnroll={(id) => console.log("Enroll:", id)}
          onContinue={(id) => console.log("Continue:", id)}
        />
      </div>
    </ThemeProvider>
  );
}
