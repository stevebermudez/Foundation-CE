import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ALL_STATES, ENABLED_STATES, type StateCode } from "@/lib/stateRegulators";
import { Search, MapPin, CheckCircle, Clock, ChevronRight } from "lucide-react";

interface StateSelectionModalProps {
  selectedState: StateCode;
  onStateChange: (state: StateCode) => void;
  trigger?: React.ReactNode;
}

export default function StateSelectionModal({
  selectedState,
  onStateChange,
  trigger,
}: StateSelectionModalProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredStates = ALL_STATES.filter((state) =>
    state.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    state.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const enabledStates = filteredStates.filter((s) => s.enabled);
  const comingSoonStates = filteredStates.filter((s) => s.comingSoon && !s.enabled);

  const handleSelectState = (code: StateCode) => {
    const state = ALL_STATES.find((s) => s.code === code);
    if (state?.enabled) {
      onStateChange(code);
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-2" data-testid="button-change-state">
            <MapPin className="h-4 w-4" />
            {selectedState}
            <ChevronRight className="h-3 w-3" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Select Your State</DialogTitle>
          <DialogDescription>
            Choose your state to see relevant courses and compliance requirements. More states coming soon!
          </DialogDescription>
        </DialogHeader>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search states..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            data-testid="input-search-states"
          />
        </div>

        <Tabs defaultValue="available">
          <TabsList className="w-full">
            <TabsTrigger value="available" className="flex-1" data-testid="tab-available-states">
              Available ({ENABLED_STATES.length})
            </TabsTrigger>
            <TabsTrigger value="coming-soon" className="flex-1" data-testid="tab-coming-soon-states">
              Coming Soon ({ALL_STATES.length - ENABLED_STATES.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="available">
            <ScrollArea className="h-64">
              <div className="space-y-2 pr-4">
                {enabledStates.length > 0 ? (
                  enabledStates.map((state) => (
                    <button
                      key={state.code}
                      onClick={() => handleSelectState(state.code)}
                      className={`w-full flex items-center justify-between p-3 rounded-lg border transition-colors hover-elevate ${
                        selectedState === state.code
                          ? "border-primary bg-primary/5"
                          : ""
                      }`}
                      data-testid={`button-state-${state.code}`}
                    >
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary" className="w-10 justify-center">
                          {state.code}
                        </Badge>
                        <div className="text-left">
                          <p className="font-medium">{state.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {state.agencies.length} regulatory agencies
                          </p>
                        </div>
                      </div>
                      {selectedState === state.code && (
                        <CheckCircle className="h-5 w-5 text-primary" />
                      )}
                    </button>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    No states match your search
                  </p>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="coming-soon">
            <ScrollArea className="h-64">
              <div className="grid grid-cols-2 gap-2 pr-4">
                {comingSoonStates.length > 0 ? (
                  comingSoonStates.map((state) => (
                    <div
                      key={state.code}
                      className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 opacity-60"
                    >
                      <Badge variant="outline" className="w-10 justify-center">
                        {state.code}
                      </Badge>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{state.name}</p>
                      </div>
                      <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    </div>
                  ))
                ) : (
                  <p className="col-span-2 text-center text-muted-foreground py-8">
                    No states match your search
                  </p>
                )}
              </div>
            </ScrollArea>
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-900">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                We're actively working to expand to all 50 states. Join our waitlist to be notified when your state becomes available.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
