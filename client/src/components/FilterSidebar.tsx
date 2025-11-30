import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { X, RotateCcw } from "lucide-react";

export interface FilterState {
  states: string[];
  professions: string[];
  categories: string[];
  testingMode: string;
  ceHours: string;
  educationType: string;
  realEstateType: string;
}

interface FilterSidebarProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onClose?: () => void;
  isMobile?: boolean;
}

const stateOptions = [
  { value: "CA", label: "California (DRE)" },
  { value: "FL", label: "Florida (FREC)" },
];

const professionOptions = [
  { value: "real_estate", label: "Real Estate" },
  { value: "insurance", label: "Insurance" },
  { value: "nmls", label: "NMLS" },
];

const educationTypeOptions = [
  { value: "ce", label: "Continuing Education" },
  { value: "pre_license", label: "Pre-License" },
];

const realEstateTypeOptions = [
  { value: "salesperson", label: "Salesperson" },
  { value: "broker", label: "Broker" },
];

const categoryOptions = [
  { value: "ethics", label: "Ethics" },
  { value: "fair_housing", label: "Fair Housing" },
  { value: "agency", label: "Agency" },
  { value: "contracts", label: "Contracts" },
  { value: "property_management", label: "Property Management" },
  { value: "trust_funds", label: "Trust Funds" },
  { value: "risk_management", label: "Risk Management" },
  { value: "laws_regulations", label: "Laws & Regulations" },
];

const testingModeOptions = [
  { value: "all", label: "All Options" },
  { value: "untimed", label: "No Timer Only" },
  { value: "timed", label: "Timed Only" },
];

const ceHoursOptions = [
  { value: "all", label: "All CE Hours" },
  { value: "1-3", label: "1-3 Hours" },
  { value: "4-8", label: "4-8 Hours" },
  { value: "9+", label: "9+ Hours" },
];

export default function FilterSidebar({
  filters,
  onFiltersChange,
  onClose,
  isMobile = false,
}: FilterSidebarProps) {
  const handleCheckboxChange = (
    key: "states" | "professions" | "categories" | "realEstateType",
    value: string,
    checked: boolean
  ) => {
    const newValues = checked
      ? [...filters[key], value]
      : filters[key].filter((v) => v !== value);
    onFiltersChange({ ...filters, [key]: newValues });
  };

  const handleRadioChange = (key: "testingMode" | "ceHours" | "educationType" | "realEstateType", value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const handleReset = () => {
    onFiltersChange({
      states: [],
      professions: [],
      categories: [],
      testingMode: "all",
      ceHours: "all",
      educationType: "all",
      realEstateType: "all",
    });
  };

  const activeFiltersCount =
    filters.states.length +
    filters.professions.length +
    filters.categories.length +
    (filters.testingMode !== "all" ? 1 : 0) +
    (filters.ceHours !== "all" ? 1 : 0) +
    (filters.educationType !== "all" ? 1 : 0) +
    (filters.realEstateType !== "all" ? 1 : 0);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between gap-2 pb-4">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold">Filters</h3>
          {activeFiltersCount > 0 && (
            <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
              {activeFiltersCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {activeFiltersCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="gap-1 text-muted-foreground"
              data-testid="button-reset-filters"
            >
              <RotateCcw className="h-3 w-3" />
              Reset
            </Button>
          )}
          {isMobile && onClose && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              data-testid="button-close-filters"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <Separator className="mb-4" />

      <div className="flex-1 overflow-y-auto">
        <Accordion type="multiple" defaultValue={["state", "profession", "education", "testing"]} className="w-full">
          <AccordionItem value="state">
            <AccordionTrigger className="text-sm font-medium">State</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3">
                {stateOptions.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`state-${option.value}`}
                      checked={filters.states.includes(option.value)}
                      onCheckedChange={(checked) =>
                        handleCheckboxChange("states", option.value, checked as boolean)
                      }
                      data-testid={`checkbox-state-${option.value}`}
                    />
                    <Label
                      htmlFor={`state-${option.value}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="profession">
            <AccordionTrigger className="text-sm font-medium">Profession</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3">
                {professionOptions.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`profession-${option.value}`}
                      checked={filters.professions.includes(option.value)}
                      onCheckedChange={(checked) =>
                        handleCheckboxChange("professions", option.value, checked as boolean)
                      }
                      data-testid={`checkbox-profession-${option.value}`}
                    />
                    <Label
                      htmlFor={`profession-${option.value}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="education">
            <AccordionTrigger className="text-sm font-medium">Education Type</AccordionTrigger>
            <AccordionContent>
              <RadioGroup
                value={filters.educationType}
                onValueChange={(value) => handleRadioChange("educationType", value)}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="all" id="education-all" data-testid="radio-education-all" />
                  <Label htmlFor="education-all" className="text-sm font-normal cursor-pointer">
                    All Types
                  </Label>
                </div>
                {educationTypeOptions.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <RadioGroupItem
                      value={option.value}
                      id={`education-${option.value}`}
                      data-testid={`radio-education-${option.value}`}
                    />
                    <Label
                      htmlFor={`education-${option.value}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {option.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </AccordionContent>
          </AccordionItem>

          {filters.professions.includes("real_estate") && (
            <AccordionItem value="realestate-type">
              <AccordionTrigger className="text-sm font-medium">Real Estate Type</AccordionTrigger>
              <AccordionContent>
                <RadioGroup
                  value={filters.realEstateType}
                  onValueChange={(value) => handleRadioChange("realEstateType", value)}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="all" id="realestste-all" data-testid="radio-realestste-all" />
                    <Label htmlFor="realestste-all" className="text-sm font-normal cursor-pointer">
                      All Types
                    </Label>
                  </div>
                  {realEstateTypeOptions.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <RadioGroupItem
                        value={option.value}
                        id={`realestste-${option.value}`}
                        data-testid={`radio-realestste-${option.value}`}
                      />
                      <Label
                        htmlFor={`realestste-${option.value}`}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </AccordionContent>
            </AccordionItem>
          )}

          <AccordionItem value="testing">
            <AccordionTrigger className="text-sm font-medium">Testing Mode</AccordionTrigger>
            <AccordionContent>
              <RadioGroup
                value={filters.testingMode}
                onValueChange={(value) => handleRadioChange("testingMode", value)}
              >
                {testingModeOptions.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <RadioGroupItem
                      value={option.value}
                      id={`testing-${option.value}`}
                      data-testid={`radio-testing-${option.value}`}
                    />
                    <Label
                      htmlFor={`testing-${option.value}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {option.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="ceHours">
            <AccordionTrigger className="text-sm font-medium">CE Hours</AccordionTrigger>
            <AccordionContent>
              <RadioGroup
                value={filters.ceHours}
                onValueChange={(value) => handleRadioChange("ceHours", value)}
              >
                {ceHoursOptions.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <RadioGroupItem
                      value={option.value}
                      id={`ce-${option.value}`}
                      data-testid={`radio-ce-${option.value}`}
                    />
                    <Label
                      htmlFor={`ce-${option.value}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {option.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="category">
            <AccordionTrigger className="text-sm font-medium">Category</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3">
                {categoryOptions.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`category-${option.value}`}
                      checked={filters.categories.includes(option.value)}
                      onCheckedChange={(checked) =>
                        handleCheckboxChange("categories", option.value, checked as boolean)
                      }
                      data-testid={`checkbox-category-${option.value}`}
                    />
                    <Label
                      htmlFor={`category-${option.value}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {isMobile && (
        <div className="pt-4 border-t mt-4">
          <Button className="w-full" onClick={onClose} data-testid="button-apply-filters">
            Apply Filters
          </Button>
        </div>
      )}
    </div>
  );
}
