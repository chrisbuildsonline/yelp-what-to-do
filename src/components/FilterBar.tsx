import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FilterBarProps {
  onFilterChange: (filters: FilterState) => void;
}

export interface FilterState {
  cuisine: string;
  priceRange: string;
  rating: string;
}

export const FilterBar = ({ onFilterChange }: FilterBarProps) => {
  const handleFilterChange = (key: keyof FilterState, value: string) => {
    // In a real app, we'd maintain filter state here
    onFilterChange({ cuisine: "all", priceRange: "all", rating: "all", [key]: value });
  };

  return (
    <div className="flex flex-wrap items-center gap-4 p-6 bg-card rounded-xl border border-border shadow-sm">
      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
        <SlidersHorizontal className="h-4 w-4" />
        <span>Filters</span>
      </div>

      <Select onValueChange={(value) => handleFilterChange("cuisine", value)}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Cuisine" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Cuisines</SelectItem>
          <SelectItem value="mediterranean">Mediterranean</SelectItem>
          <SelectItem value="japanese">Japanese</SelectItem>
          <SelectItem value="french">French</SelectItem>
          <SelectItem value="indian">Indian</SelectItem>
          <SelectItem value="healthy">Healthy</SelectItem>
        </SelectContent>
      </Select>

      <Select onValueChange={(value) => handleFilterChange("priceRange", value)}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Price Range" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Prices</SelectItem>
          <SelectItem value="$">$ - Budget</SelectItem>
          <SelectItem value="$$">$$ - Moderate</SelectItem>
          <SelectItem value="$$$">$$$ - Upscale</SelectItem>
        </SelectContent>
      </Select>

      <Select onValueChange={(value) => handleFilterChange("rating", value)}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Rating" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Ratings</SelectItem>
          <SelectItem value="4.5">4.5+ Stars</SelectItem>
          <SelectItem value="4.0">4.0+ Stars</SelectItem>
          <SelectItem value="3.5">3.5+ Stars</SelectItem>
        </SelectContent>
      </Select>

      <Button variant="outline" size="sm" className="ml-auto">
        Clear Filters
      </Button>
    </div>
  );
};
