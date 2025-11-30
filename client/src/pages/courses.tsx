import CourseCatalog from "@/components/CourseCatalog";

interface CoursesPageProps {
  selectedState: "CA" | "FL";
}

export default function CoursesPage({ selectedState }: CoursesPageProps) {
  return (
    <div className="py-8 px-4">
      <div className="mx-auto max-w-7xl mb-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">
          Browse Courses
        </h1>
        <p className="text-muted-foreground">
          Explore our catalog of state-approved continuing education courses for real estate and insurance professionals.
        </p>
      </div>
      <CourseCatalog selectedState={selectedState} />
    </div>
  );
}
