import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import CourseCard, { type Course } from "./CourseCard";
import FilterSidebar, { type FilterState } from "./FilterSidebar";
import { Search, SlidersHorizontal, LayoutGrid, List } from "lucide-react";

import caRealEstate from "@assets/generated_images/california_luxury_real_estate.png";
import flRealEstate from "@assets/generated_images/florida_beachfront_properties.png";
import insuranceImg from "@assets/generated_images/insurance_agent_at_desk.png";

interface CourseCatalogProps {
  selectedState: "CA" | "FL";
}

// todo: remove mock functionality
const mockCourses: Course[] = [
  {
    id: "1",
    title: "California Real Estate Ethics and Professional Conduct",
    description: "Comprehensive ethics training covering fiduciary duties, disclosure requirements, and professional standards for CA licensees.",
    thumbnail: caRealEstate,
    category: "Ethics",
    ceHours: 3,
    state: "CA",
    profession: "real_estate",
    timedOption: true,
    untimedOption: true,
    duration: "3h 30m",
    lessons: 12,
    enrolled: true,
    progress: 65,
  },
  {
    id: "2",
    title: "Fair Housing Laws and Practices",
    description: "Essential training on federal and state fair housing laws, protected classes, and avoiding discrimination in real estate transactions.",
    thumbnail: caRealEstate,
    category: "Fair Housing",
    ceHours: 3,
    state: "CA",
    profession: "real_estate",
    timedOption: true,
    untimedOption: true,
    duration: "3h 15m",
    lessons: 10,
  },
  {
    id: "3",
    title: "Florida Property Insurance Fundamentals",
    description: "Complete overview of Florida property insurance regulations, coverage types, and claims handling procedures.",
    thumbnail: insuranceImg,
    category: "Risk Management",
    ceHours: 4,
    state: "FL",
    profession: "insurance",
    timedOption: true,
    untimedOption: true,
    duration: "4h 45m",
    lessons: 15,
  },
  {
    id: "4",
    title: "Agency Relationships and Disclosures",
    description: "Master the complexities of agency relationships, disclosure requirements, and client representation in real estate.",
    thumbnail: flRealEstate,
    category: "Agency",
    ceHours: 3,
    state: "FL",
    profession: "real_estate",
    timedOption: true,
    untimedOption: true,
    duration: "3h 20m",
    lessons: 11,
    enrolled: true,
    progress: 100,
    completed: true,
  },
  {
    id: "5",
    title: "Trust Fund Handling and Management",
    description: "Learn proper procedures for handling client trust funds, escrow accounts, and compliance with DRE regulations.",
    thumbnail: caRealEstate,
    category: "Trust Funds",
    ceHours: 3,
    state: "CA",
    profession: "real_estate",
    timedOption: false,
    untimedOption: true,
    duration: "3h 10m",
    lessons: 9,
  },
  {
    id: "6",
    title: "Florida Life Insurance CE Package",
    description: "Complete continuing education package for Florida life insurance agents covering regulations, ethics, and product updates.",
    thumbnail: insuranceImg,
    category: "Laws & Regulations",
    ceHours: 8,
    state: "FL",
    profession: "insurance",
    timedOption: true,
    untimedOption: true,
    duration: "8h 30m",
    lessons: 24,
  },
  {
    id: "7",
    title: "California Property Management Essentials",
    description: "Comprehensive training on property management laws, landlord-tenant relations, and best practices for CA managers.",
    thumbnail: caRealEstate,
    category: "Property Management",
    ceHours: 6,
    state: "CA",
    profession: "real_estate",
    timedOption: true,
    untimedOption: true,
    duration: "6h 15m",
    lessons: 18,
    enrolled: true,
    progress: 30,
  },
  {
    id: "8",
    title: "Contract Law for Real Estate Professionals",
    description: "Deep dive into contract formation, contingencies, disclosures, and legal requirements for real estate transactions.",
    thumbnail: flRealEstate,
    category: "Contracts",
    ceHours: 4,
    state: "FL",
    profession: "real_estate",
    timedOption: true,
    untimedOption: true,
    duration: "4h 30m",
    lessons: 14,
  },
];

export default function CourseCatalog({ selectedState }: CourseCatalogProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    states: [selectedState],
    professions: [],
    categories: [],
    testingMode: "all",
    ceHours: "all",
  });

  const filteredCourses = useMemo(() => {
    return mockCourses.filter((course) => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          course.title.toLowerCase().includes(query) ||
          course.description.toLowerCase().includes(query) ||
          course.category.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      if (filters.states.length > 0 && !filters.states.includes(course.state)) {
        return false;
      }

      if (filters.professions.length > 0 && !filters.professions.includes(course.profession)) {
        return false;
      }

      if (filters.categories.length > 0) {
        const categoryKey = course.category.toLowerCase().replace(/ /g, "_");
        if (!filters.categories.includes(categoryKey)) {
          return false;
        }
      }

      if (filters.testingMode === "untimed" && !course.untimedOption) {
        return false;
      }
      if (filters.testingMode === "timed" && !course.timedOption) {
        return false;
      }

      if (filters.ceHours !== "all") {
        if (filters.ceHours === "1-3" && (course.ceHours < 1 || course.ceHours > 3)) {
          return false;
        }
        if (filters.ceHours === "4-8" && (course.ceHours < 4 || course.ceHours > 8)) {
          return false;
        }
        if (filters.ceHours === "9+" && course.ceHours < 9) {
          return false;
        }
      }

      return true;
    });
  }, [searchQuery, filters]);

  const sortedCourses = useMemo(() => {
    const courses = [...filteredCourses];
    switch (sortBy) {
      case "popular":
        return courses.sort((a, b) => b.lessons - a.lessons);
      case "ce-hours":
        return courses.sort((a, b) => b.ceHours - a.ceHours);
      case "title":
        return courses.sort((a, b) => a.title.localeCompare(b.title));
      default:
        return courses;
    }
  }, [filteredCourses, sortBy]);

  const handleEnroll = (courseId: string) => {
    console.log("Enrolling in course:", courseId);
  };

  const handleContinue = (courseId: string) => {
    console.log("Continuing course:", courseId);
  };

  return (
    <section className="py-12 px-4">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col md:flex-row gap-8">
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-20 p-4 bg-card rounded-lg border">
              <FilterSidebar filters={filters} onFiltersChange={setFilters} />
            </div>
          </aside>

          <div className="flex-1">
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search courses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-courses"
                />
              </div>

              <div className="flex items-center gap-2">
                <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="lg:hidden gap-2" data-testid="button-open-filters">
                      <SlidersHorizontal className="h-4 w-4" />
                      Filters
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-80 p-4">
                    <FilterSidebar
                      filters={filters}
                      onFiltersChange={setFilters}
                      onClose={() => setFilterOpen(false)}
                      isMobile
                    />
                  </SheetContent>
                </Sheet>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40" data-testid="select-sort">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="popular">Most Popular</SelectItem>
                    <SelectItem value="ce-hours">CE Hours</SelectItem>
                    <SelectItem value="title">Title A-Z</SelectItem>
                  </SelectContent>
                </Select>

                <div className="hidden sm:flex border rounded-md">
                  <Button
                    variant={viewMode === "grid" ? "secondary" : "ghost"}
                    size="icon"
                    onClick={() => setViewMode("grid")}
                    data-testid="button-view-grid"
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "secondary" : "ghost"}
                    size="icon"
                    onClick={() => setViewMode("list")}
                    data-testid="button-view-list"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-sm text-muted-foreground" data-testid="text-course-count">
                Showing {sortedCourses.length} of {mockCourses.length} courses
              </p>
            </div>

            {sortedCourses.length > 0 ? (
              <div
                className={
                  viewMode === "grid"
                    ? "grid gap-6 sm:grid-cols-2 xl:grid-cols-3"
                    : "flex flex-col gap-4"
                }
              >
                {sortedCourses.map((course) => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    onEnroll={handleEnroll}
                    onContinue={handleContinue}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Search className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="font-semibold text-lg mb-2">No courses found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your filters or search terms
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("");
                    setFilters({
                      states: [],
                      professions: [],
                      categories: [],
                      testingMode: "all",
                      ceHours: "all",
                    });
                  }}
                  data-testid="button-clear-filters"
                >
                  Clear all filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
