import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
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
import { Skeleton } from "@/components/ui/skeleton";

import caRealEstate from "@assets/generated_images/california_luxury_real_estate.png";
import flRealEstate from "@assets/generated_images/florida_beachfront_properties.png";
import insuranceImg from "@assets/generated_images/insurance_agent_at_desk.png";

interface CourseCatalogProps {
  selectedState: "CA" | "FL";
}

// Transform database course to UI course
function transformCourse(dbCourse: any): Course {
  return {
    id: dbCourse.id,
    title: dbCourse.title,
    description: dbCourse.description || "",
    thumbnail: dbCourse.productType === "Insurance" ? insuranceImg : (dbCourse.state === "CA" ? caRealEstate : flRealEstate),
    category: dbCourse.requirementBucket || "Course",
    ceHours: dbCourse.hoursRequired || 0,
    state: dbCourse.state as "CA" | "FL",
    profession: (dbCourse.productType === "Insurance" ? "insurance" : "real_estate") as any,
    educationType: (dbCourse.requirementCycleType === "Post-Licensing" ? "pre_license" : "ce") as any,
    realEstateType: dbCourse.licenseType?.toLowerCase().includes("broker") ? "broker" : "salesperson",
    timedOption: true,
    untimedOption: true,
    duration: `${dbCourse.hoursRequired}h`,
    lessons: Math.ceil((dbCourse.hoursRequired || 0) / 0.5),
    price: Math.round(dbCourse.price / 100),
  };
}

// Fallback mock data
const mockCourses: Course[] = [
  {
    id: "1",
    title: "California Real Estate Ethics and Professional Conduct - CE",
    description: "Comprehensive ethics training covering fiduciary duties, disclosure requirements, and professional standards for CA licensees.",
    thumbnail: caRealEstate,
    category: "Ethics",
    ceHours: 3,
    state: "CA",
    profession: "real_estate",
    educationType: "ce",
    realEstateType: "salesperson",
    timedOption: true,
    untimedOption: true,
    duration: "3h 30m",
    lessons: 12,
    price: 15,
    enrolled: true,
    progress: 65,
  },
  {
    id: "2",
    title: "Fair Housing Laws and Practices - CE",
    description: "Essential training on federal and state fair housing laws, protected classes, and avoiding discrimination in real estate transactions.",
    thumbnail: caRealEstate,
    category: "Fair Housing",
    ceHours: 3,
    state: "CA",
    profession: "real_estate",
    educationType: "ce",
    realEstateType: "salesperson",
    timedOption: true,
    untimedOption: true,
    duration: "3h 15m",
    lessons: 10,
    price: 15,
  },
  {
    id: "3",
    title: "California Real Estate Broker Management - Pre-License",
    description: "Comprehensive pre-license training for real estate brokers covering management, compliance, and operational requirements.",
    thumbnail: caRealEstate,
    category: "Management",
    ceHours: 6,
    state: "CA",
    profession: "real_estate",
    educationType: "pre_license",
    realEstateType: "broker",
    timedOption: true,
    untimedOption: false,
    duration: "6h 45m",
    lessons: 18,
    price: 15,
  },
  {
    id: "4",
    title: "Florida Property Insurance Fundamentals - CE",
    description: "Complete overview of Florida property insurance regulations, coverage types, and claims handling procedures.",
    thumbnail: insuranceImg,
    category: "Risk Management",
    ceHours: 4,
    state: "FL",
    profession: "insurance",
    educationType: "ce",
    timedOption: true,
    untimedOption: true,
    duration: "4h 45m",
    lessons: 15,
    price: 15,
  },
  {
    id: "5",
    title: "Florida Insurance Pre-License: Property & Casualty",
    description: "Complete pre-license training for property and casualty insurance agents covering regulations, products, and compliance.",
    thumbnail: insuranceImg,
    category: "Regulations",
    ceHours: 20,
    state: "FL",
    profession: "insurance",
    educationType: "pre_license",
    timedOption: true,
    untimedOption: false,
    duration: "24h 30m",
    lessons: 48,
    price: 15,
  },
  {
    id: "6",
    title: "Agency Relationships and Disclosures - CE",
    description: "Master the complexities of agency relationships, disclosure requirements, and client representation in real estate.",
    thumbnail: flRealEstate,
    category: "Agency",
    ceHours: 3,
    state: "FL",
    profession: "real_estate",
    educationType: "ce",
    realEstateType: "salesperson",
    timedOption: true,
    untimedOption: true,
    duration: "3h 20m",
    lessons: 11,
    price: 15,
    enrolled: true,
    progress: 100,
    completed: true,
  },
  {
    id: "7",
    title: "Trust Fund Handling and Management - CE",
    description: "Learn proper procedures for handling client trust funds, escrow accounts, and compliance with DRE regulations.",
    thumbnail: caRealEstate,
    category: "Trust Funds",
    ceHours: 3,
    state: "CA",
    profession: "real_estate",
    educationType: "ce",
    realEstateType: "broker",
    timedOption: false,
    untimedOption: true,
    duration: "3h 10m",
    lessons: 9,
    price: 15,
  },
  {
    id: "8",
    title: "Florida Life Insurance CE Package",
    description: "Complete continuing education package for Florida life insurance agents covering regulations, ethics, and product updates.",
    thumbnail: insuranceImg,
    category: "Laws & Regulations",
    ceHours: 8,
    state: "FL",
    profession: "insurance",
    educationType: "ce",
    timedOption: true,
    untimedOption: true,
    duration: "8h 30m",
    lessons: 24,
    price: 15,
  },
  {
    id: "9",
    title: "California Property Management Essentials - CE",
    description: "Comprehensive training on property management laws, landlord-tenant relations, and best practices for CA managers.",
    thumbnail: caRealEstate,
    category: "Property Management",
    ceHours: 6,
    state: "CA",
    profession: "real_estate",
    educationType: "ce",
    realEstateType: "salesperson",
    timedOption: true,
    untimedOption: true,
    duration: "6h 15m",
    lessons: 18,
    price: 15,
    enrolled: true,
    progress: 30,
  },
  {
    id: "10",
    title: "Contract Law for Real Estate Professionals - CE",
    description: "Deep dive into contract formation, contingencies, disclosures, and legal requirements for real estate transactions.",
    thumbnail: flRealEstate,
    category: "Contracts",
    ceHours: 4,
    state: "FL",
    profession: "real_estate",
    educationType: "ce",
    realEstateType: "salesperson",
    timedOption: true,
    untimedOption: true,
    duration: "4h 30m",
    lessons: 14,
    price: 15,
  },
  {
    id: "11",
    title: "California Real Estate Pre-License Salesperson",
    description: "Complete pre-license training for California real estate salespersons covering laws, ethics, and transactions.",
    thumbnail: caRealEstate,
    category: "Laws & Regulations",
    ceHours: 8,
    state: "CA",
    profession: "real_estate",
    educationType: "pre_license",
    realEstateType: "salesperson",
    timedOption: true,
    untimedOption: false,
    duration: "9h 30m",
    lessons: 28,
    price: 15,
  },
];

export default function CourseCatalog({ selectedState }: CourseCatalogProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedProfession, setSelectedProfession] = useState<"real_estate" | "insurance">("real_estate");
  const [filters, setFilters] = useState<FilterState>({
    states: [selectedState],
    professions: [selectedProfession],
    categories: [],
    testingMode: "all",
    ceHours: "all",
    educationType: "all",
    realEstateType: "all",
  });

  // Fetch courses from API with state filter
  const { data: dbCourses = [], isLoading } = useQuery({
    queryKey: ["/api/courses", { state: selectedState }],
    queryFn: async () => {
      const res = await fetch(`/api/courses?state=${selectedState}`);
      if (!res.ok) throw new Error("Failed to fetch courses");
      return res.json();
    },
  });

  // Transform database courses to UI format, use real courses if available
  const courses = useMemo(() => {
    if (dbCourses.length > 0) {
      return dbCourses.map(transformCourse);
    }
    // Fallback to mock courses filtered by selected state
    return mockCourses.filter(c => c.state === selectedState);
  }, [dbCourses, selectedState]);

  const handleProfessionChange = (profession: "real_estate" | "insurance") => {
    setSelectedProfession(profession);
    setFilters({
      states: [selectedState],
      professions: [profession],
      categories: [],
      testingMode: "all",
      ceHours: "all",
      educationType: "all",
      realEstateType: profession === "real_estate" ? "all" : "all",
    });
  };

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
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

      if (filters.educationType !== "all" && course.educationType !== filters.educationType) {
        return false;
      }

      if (filters.realEstateType !== "all" && course.profession === "real_estate") {
        if (course.realEstateType !== filters.realEstateType) {
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
        <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex gap-2">
            <Button
              variant={selectedProfession === "real_estate" ? "secondary" : "outline"}
              onClick={() => handleProfessionChange("real_estate")}
              data-testid="button-profession-real-estate"
            >
              Real Estate
            </Button>
            <Button
              variant={selectedProfession === "insurance" ? "secondary" : "outline"}
              onClick={() => handleProfessionChange("insurance")}
              data-testid="button-profession-insurance"
            >
              Insurance
            </Button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-20 p-4 bg-card rounded-lg border">
              <FilterSidebar filters={filters} onFiltersChange={setFilters} selectedProfession={selectedProfession} />
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
                      selectedProfession={selectedProfession}
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
                {isLoading ? "Loading..." : `Showing ${sortedCourses.length} of ${courses.length} courses`}
              </p>
            </div>

            {isLoading ? (
              <div className={viewMode === "grid" ? "grid gap-6 sm:grid-cols-2 xl:grid-cols-3" : "flex flex-col gap-4"}>
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="rounded-lg overflow-hidden">
                    <Skeleton className="aspect-video" />
                    <div className="p-4 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : sortedCourses.length > 0 ? (
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
                      states: [selectedState],
                      professions: [selectedProfession],
                      categories: [],
                      testingMode: "all",
                      ceHours: "all",
                      educationType: "all",
                      realEstateType: "all",
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
