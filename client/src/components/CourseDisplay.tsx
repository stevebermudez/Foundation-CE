import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, BookOpen, Target, Zap } from "lucide-react";

interface CourseDisplayProps {
  title: string;
  description?: string;
  licenseType: string;
  requirementCycleType: string;
  requirementBucket: string;
  hoursRequired: number;
  deliveryMethod: string;
  difficultyLevel?: string;
  price: number;
  sku?: string;
}

export function CourseDisplay({
  title,
  description,
  licenseType,
  requirementCycleType,
  requirementBucket,
  hoursRequired,
  deliveryMethod,
  difficultyLevel,
  price,
  sku,
}: CourseDisplayProps) {
  const getBucketColor = (bucket: string) => {
    switch (bucket) {
      case "Core Law":
        return "bg-red-100 text-red-800";
      case "Ethics & Business Practices":
        return "bg-blue-100 text-blue-800";
      case "Specialty / Elective":
        return "bg-purple-100 text-purple-800";
      case "Post-Licensing Mandatory":
        return "bg-orange-100 text-orange-800";
      case "Package":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getCycleColor = (cycle: string) => {
    return cycle === "Post-Licensing"
      ? "bg-amber-50 border-l-4 border-l-amber-500"
      : "bg-cyan-50 border-l-4 border-l-cyan-500";
  };

  const priceDisplay = (price / 100).toFixed(2);

  return (
    <Card className={`${getCycleColor(requirementCycleType)}`}>
      <CardHeader>
        <div className="space-y-3">
          <div>
            <CardTitle className="text-lg mb-2">{title}</CardTitle>
            {description && <p className="text-sm text-gray-600">{description}</p>}
          </div>

          {/* Classification Badges */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">{licenseType}</Badge>
            <Badge variant="outline">{requirementCycleType}</Badge>
            <Badge className={getBucketColor(requirementBucket)}>{requirementBucket}</Badge>
            {difficultyLevel && <Badge variant="secondary">{difficultyLevel}</Badge>}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {/* Key Details */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="flex items-center gap-1 text-gray-600 mb-1">
                <Clock className="w-4 h-4" />
                <p className="text-xs font-medium">Hours</p>
              </div>
              <p className="text-lg font-bold text-gray-900">{hoursRequired}h</p>
            </div>

            <div>
              <div className="flex items-center gap-1 text-gray-600 mb-1">
                <BookOpen className="w-4 h-4" />
                <p className="text-xs font-medium">Delivery</p>
              </div>
              <p className="text-sm font-medium text-gray-900">{deliveryMethod}</p>
            </div>

            <div>
              <div className="flex items-center gap-1 text-gray-600 mb-1">
                <Zap className="w-4 h-4" />
                <p className="text-xs font-medium">Price</p>
              </div>
              <p className="text-lg font-bold text-green-600">${priceDisplay}</p>
            </div>

            {sku && (
              <div>
                <div className="flex items-center gap-1 text-gray-600 mb-1">
                  <Target className="w-4 h-4" />
                  <p className="text-xs font-medium">SKU</p>
                </div>
                <p className="text-sm font-mono text-gray-600">{sku}</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
