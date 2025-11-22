import { Star, MapPin, DollarSign } from "lucide-react";
import { Business } from "@/data/mockData";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface BusinessCardProps {
  business: Business;
  onClick: () => void;
}

export const BusinessCard = ({ business, onClick }: BusinessCardProps) => {
  return (
    <Card
      onClick={onClick}
      className="group cursor-pointer overflow-hidden border-border hover:shadow-[var(--card-shadow-hover)] transition-all duration-300 hover:-translate-y-1"
      style={{ boxShadow: "var(--card-shadow)" }}
    >
      <div className="relative h-56 overflow-hidden">
        <img
          src={business.image}
          alt={business.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute top-3 right-3 flex gap-2">
          <Badge className="bg-card/95 text-card-foreground border-0 backdrop-blur">
            {business.cuisine}
          </Badge>
        </div>
      </div>

      <div className="p-5 space-y-3">
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
            {business.name}
          </h3>
          
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-accent text-accent" />
              <span className="font-semibold text-foreground">{business.rating}</span>
              <span className="text-muted-foreground">({business.reviewCount})</span>
            </div>
            <div className="flex items-center text-muted-foreground">
              <DollarSign className="h-4 w-4" />
              <span>{business.priceRange}</span>
            </div>
          </div>

          <div className="flex items-start gap-1.5 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <div>
              <div>{business.location.address}</div>
              <div className="text-xs">{business.location.distance} away</div>
            </div>
          </div>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2">
          {business.description}
        </p>

        <div className="flex flex-wrap gap-2 pt-2">
          {business.features.slice(0, 3).map((feature) => (
            <span
              key={feature}
              className="text-xs px-3 py-1 rounded-full bg-muted text-muted-foreground"
            >
              {feature}
            </span>
          ))}
        </div>
      </div>
    </Card>
  );
};
