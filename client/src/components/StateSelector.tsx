import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronRight, Building, Shield } from "lucide-react";

import caImage from "@assets/generated_images/california_luxury_real_estate.png";
import flImage from "@assets/generated_images/florida_beachfront_properties.png";

interface StateSelectorProps {
  onSelectState: (state: "CA" | "FL") => void;
}

const states = [
  {
    id: "CA" as const,
    name: "California",
    agency: "DRE",
    agencyFull: "Department of Real Estate",
    image: caImage,
    requirements: "45 CE hours required",
    professions: ["Real Estate", "Insurance"],
  },
  {
    id: "FL" as const,
    name: "Florida",
    agency: "FREC",
    agencyFull: "Florida Real Estate Commission",
    image: flImage,
    requirements: "14 CE hours required",
    professions: ["Real Estate", "Insurance"],
  },
];

export default function StateSelector({ onSelectState }: StateSelectorProps) {
  return (
    <section className="py-16 px-4 bg-muted/30">
      <div className="mx-auto max-w-5xl">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">
            Choose Your State
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Select your state to see the specific continuing education requirements and approved courses for your license.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {states.map((state) => (
            <Card
              key={state.id}
              className="overflow-hidden cursor-pointer hover-elevate"
              onClick={() => onSelectState(state.id)}
              data-testid={`card-state-${state.id}`}
            >
              <div className="relative h-40 overflow-hidden">
                <img
                  src={state.image}
                  alt={state.name}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-2xl font-bold text-white">{state.name}</h3>
                </div>
              </div>

              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="secondary" className="gap-1">
                    <Shield className="h-3 w-3" />
                    {state.agency}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {state.agencyFull}
                  </span>
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{state.requirements}</span>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {state.professions.map((profession) => (
                    <Badge key={profession} variant="outline" className="text-xs">
                      {profession}
                    </Badge>
                  ))}
                </div>

                <Button className="w-full gap-2" data-testid={`button-select-${state.id}`}>
                  Browse {state.name} Courses
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
