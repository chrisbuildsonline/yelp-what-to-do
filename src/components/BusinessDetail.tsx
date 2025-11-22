import { X, Star, MapPin, Clock, Phone, Check } from "lucide-react";
import { Business } from "@/data/mockData";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface BusinessDetailProps {
  business: Business | null;
  isOpen: boolean;
  onClose: () => void;
  onReserve: () => void;
}

export const BusinessDetail = ({ business, isOpen, onClose, onReserve }: BusinessDetailProps) => {
  if (!business) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 rounded-full bg-background/80 backdrop-blur p-2 hover:bg-background transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="relative h-80 overflow-hidden">
          <img
            src={business.image}
            alt={business.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6">
            <Badge className="mb-3 bg-accent text-accent-foreground">
              {business.cuisine}
            </Badge>
            <h2 className="text-4xl font-bold text-foreground mb-2">
              {business.name}
            </h2>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Star className="h-5 w-5 fill-accent text-accent" />
                <span className="font-semibold text-foreground text-base">
                  {business.rating}
                </span>
                <span className="text-muted-foreground">
                  ({business.reviewCount} reviews)
                </span>
              </div>
              <span className="text-muted-foreground">{business.priceRange}</span>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-2">About</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {business.description}
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-primary mt-0.5" />
                  <div className="text-sm">
                    <div className="font-medium text-foreground">
                      {business.location.address}
                    </div>
                    <div className="text-muted-foreground">
                      {business.location.city}
                    </div>
                    <div className="text-xs text-primary">
                      {business.location.distance} away
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-primary" />
                  <div className="text-sm">
                    <div className="font-medium text-foreground">Hours</div>
                    <div className="text-muted-foreground">{business.hours}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-primary" />
                  <div className="text-sm">
                    <div className="font-medium text-foreground">Phone</div>
                    <div className="text-muted-foreground">{business.phone}</div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-3">Features</h3>
                <div className="flex flex-wrap gap-2">
                  {business.features.map((feature) => (
                    <span
                      key={feature}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted text-sm"
                    >
                      <Check className="h-3.5 w-3.5 text-primary" />
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-4">Recent Reviews</h3>
                <div className="space-y-4">
                  {business.reviews.map((review) => (
                    <div
                      key={review.id}
                      className="p-4 rounded-lg bg-muted/50 border border-border space-y-2"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={review.avatar} alt={review.author} />
                          <AvatarFallback>{review.author[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="font-medium text-sm">{review.author}</div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <div className="flex">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-3 w-3 ${
                                    i < review.rating
                                      ? "fill-accent text-accent"
                                      : "text-muted"
                                  }`}
                                />
                              ))}
                            </div>
                            <span>{review.date}</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {review.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <Button
                size="lg"
                onClick={onReserve}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Make a Reservation
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
