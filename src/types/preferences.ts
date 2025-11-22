export interface UserPreferences {
  name: string;
  interests: string[];
  foodPreferences: string[];
  dietaryRestrictions: string[];
  partySize: number;
  companions: CompanionPreferences[];
}

export interface CompanionPreferences {
  name: string;
  interests: string[];
  foodPreferences: string[];
  dietaryRestrictions: string[];
}

export const INTEREST_OPTIONS = [
  "Art & Museums",
  "Live Music",
  "Outdoor Activities",
  "Shopping",
  "Nightlife",
  "History & Culture",
  "Sports",
  "Theater & Shows",
  "Photography",
  "Food Tours"
];

export const FOOD_PREFERENCE_OPTIONS = [
  "Italian",
  "Japanese",
  "Mexican",
  "Mediterranean",
  "Chinese",
  "Indian",
  "French",
  "Thai",
  "American",
  "Fusion",
  "Street Food",
  "Fine Dining"
];

export const DIETARY_OPTIONS = [
  "Vegetarian",
  "Vegan",
  "Gluten-Free",
  "Dairy-Free",
  "Halal",
  "Kosher",
  "Pescatarian",
  "Keto",
  "Paleo",
  "No restrictions"
];
