export interface Business {
  id: string;
  name: string;
  category: string;
  cuisine?: string;
  rating: number;
  reviewCount: number;
  priceRange: string;
  image: string;
  location: {
    address: string;
    city: string;
    distance: string;
  };
  description: string;
  hours: string;
  phone: string;
  features: string[];
  reviews: Review[];
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  date: string;
  text: string;
  avatar: string;
}

export const mockBusinesses: Business[] = [
  {
    id: "1",
    name: "The Garden Bistro",
    category: "Restaurant",
    cuisine: "Mediterranean",
    rating: 4.7,
    reviewCount: 342,
    priceRange: "$$",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop",
    location: {
      address: "125 Garden Street",
      city: "San Francisco, CA",
      distance: "0.8 miles"
    },
    description: "Fresh Mediterranean cuisine in a lush garden setting. Farm-to-table ingredients, seasonal menu, and an extensive wine list.",
    hours: "Mon-Sun: 11:00 AM - 10:00 PM",
    phone: "(415) 555-0123",
    features: ["Outdoor Seating", "Reservations", "Vegan Options", "Wine Bar"],
    reviews: [
      {
        id: "r1",
        author: "Sarah M.",
        rating: 5,
        date: "2 days ago",
        text: "Absolutely wonderful experience! The grilled octopus was perfection, and the garden atmosphere is magical at sunset.",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah"
      },
      {
        id: "r2",
        author: "James K.",
        rating: 4,
        date: "1 week ago",
        text: "Great food and ambiance. The mezze platter is perfect for sharing. Service was attentive without being intrusive.",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=James"
      }
    ]
  },
  {
    id: "2",
    name: "Sunrise Coffee House",
    category: "Cafe",
    cuisine: "Coffee & Tea",
    rating: 4.9,
    reviewCount: 521,
    priceRange: "$",
    image: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&auto=format&fit=crop",
    location: {
      address: "42 Market Plaza",
      city: "San Francisco, CA",
      distance: "0.3 miles"
    },
    description: "Artisanal coffee roasted in-house. Cozy atmosphere perfect for remote work or catching up with friends.",
    hours: "Mon-Fri: 6:30 AM - 8:00 PM, Sat-Sun: 7:00 AM - 9:00 PM",
    phone: "(415) 555-0456",
    features: ["WiFi", "Laptop Friendly", "Pastries", "Plant-Based Milk"],
    reviews: [
      {
        id: "r3",
        author: "Emily R.",
        rating: 5,
        date: "3 days ago",
        text: "Best flat white in the city! The baristas really know their craft. Perfect spot for morning work sessions.",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emily"
      }
    ]
  },
  {
    id: "3",
    name: "Sakura Sushi Bar",
    category: "Restaurant",
    cuisine: "Japanese",
    rating: 4.6,
    reviewCount: 287,
    priceRange: "$$$",
    image: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800&auto=format&fit=crop",
    location: {
      address: "890 Pine Avenue",
      city: "San Francisco, CA",
      distance: "1.2 miles"
    },
    description: "Authentic Japanese cuisine with fresh fish flown in daily. Omakase experience available with advance reservation.",
    hours: "Tue-Sun: 5:00 PM - 11:00 PM, Closed Monday",
    phone: "(415) 555-0789",
    features: ["Omakase", "Sake Selection", "Private Dining", "Traditional Seating"],
    reviews: [
      {
        id: "r4",
        author: "Michael T.",
        rating: 5,
        date: "5 days ago",
        text: "The omakase was an incredible journey. Chef's selection showcased the finest ingredients with impeccable technique.",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael"
      }
    ]
  },
  {
    id: "4",
    name: "La Petite Boulangerie",
    category: "Bakery",
    cuisine: "French",
    rating: 4.8,
    reviewCount: 412,
    priceRange: "$",
    image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800&auto=format&fit=crop",
    location: {
      address: "67 Baker Street",
      city: "San Francisco, CA",
      distance: "0.5 miles"
    },
    description: "Traditional French bakery serving authentic croissants, baguettes, and pastries. Everything made fresh daily.",
    hours: "Mon-Sun: 6:00 AM - 7:00 PM",
    phone: "(415) 555-0234",
    features: ["Fresh Daily", "Gluten-Free Options", "Custom Cakes", "Takeout"],
    reviews: [
      {
        id: "r5",
        author: "Claire B.",
        rating: 5,
        date: "1 day ago",
        text: "These croissants transport me back to Paris! Buttery, flaky perfection. The pain au chocolat is also divine.",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Claire"
      }
    ]
  },
  {
    id: "5",
    name: "Spice Route",
    category: "Restaurant",
    cuisine: "Indian",
    rating: 4.5,
    reviewCount: 198,
    priceRange: "$$",
    image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&auto=format&fit=crop",
    location: {
      address: "234 Curry Lane",
      city: "San Francisco, CA",
      distance: "1.5 miles"
    },
    description: "Contemporary Indian cuisine with regional specialties. Tandoor oven and traditional spice blends create authentic flavors.",
    hours: "Mon-Sun: 11:30 AM - 2:30 PM, 5:30 PM - 10:30 PM",
    phone: "(415) 555-0567",
    features: ["Spicy Options", "Vegetarian Friendly", "Lunch Buffet", "Catering"],
    reviews: [
      {
        id: "r6",
        author: "Priya S.",
        rating: 4,
        date: "4 days ago",
        text: "Fantastic butter chicken and garlic naan. Spice levels are customizable and the lunch buffet is great value.",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Priya"
      }
    ]
  },
  {
    id: "6",
    name: "The Green Bowl",
    category: "Restaurant",
    cuisine: "Healthy",
    rating: 4.7,
    reviewCount: 456,
    priceRange: "$$",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&auto=format&fit=crop",
    location: {
      address: "156 Health Way",
      city: "San Francisco, CA",
      distance: "0.6 miles"
    },
    description: "Fresh, organic ingredients in creative bowls and salads. Smoothies, cold-pressed juices, and superfood add-ons.",
    hours: "Mon-Sun: 8:00 AM - 9:00 PM",
    phone: "(415) 555-0890",
    features: ["Vegan", "Gluten-Free", "Organic", "Smoothies"],
    reviews: [
      {
        id: "r7",
        author: "Alex W.",
        rating: 5,
        date: "2 days ago",
        text: "Love the Buddha bowl! Fresh ingredients, great portions, and the açai bowls are perfect post-workout.",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex"
      }
    ]
  }
];
