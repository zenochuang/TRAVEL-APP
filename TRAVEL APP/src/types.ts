export type IconName = 
  | 'Plane' | 'Train' | 'Bus' | 'Car' | 'Hotel' | 'Utensils' | 'Coffee' | 'Beer'
  | 'ShoppingBag' | 'Camera' | 'MapPin' | 'Mountain' | 'Sun' | 'Moon' | 'Umbrella'
  | 'Music' | 'Ticket' | 'CreditCard' | 'DollarSign' | 'Gift' | 'Heart' | 'Star'
  | 'Flag' | 'Anchor' | 'Briefcase' | 'Home' | 'User' | 'Users' | 'Smartphone'
  | 'Wifi' | 'Battery' | 'Watch';

export interface Member {
  id: string;
  name: string;
  avatar: string; // Emoji character
}

export interface Activity {
  id: string;
  name: string;
  startTime: string; // HH:mm
  duration: string; // e.g., "2h"
  note: string;
  icon: IconName;
  link?: string; // Navigation link
}

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

export interface Expense {
  id: string;
  payerId: string;
  amount: number;
  currency: string;
  item: string;
  date: string; // ISO string
  category: 'Food' | 'Transport' | 'Accommodation' | 'Shopping' | 'Other';
  splitDetails: { [memberId: string]: number }; // Amount each person owes
}

export interface WeatherData {
  tempMin: number;
  tempMax: number;
  rainProb: number;
  condition: string;
}

export interface Trip {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  location: string;
  icon: IconName;
  members: Member[];
  itinerary: { [date: string]: Activity[] }; // Keyed by YYYY-MM-DD
  expenses: Expense[];
  todos: Todo[];
  weather: { [date: string]: { data: WeatherData, advice: string } }; // Persisted weather data
}

export type Currency = 'TWD' | 'JPY' | 'USD' | 'EUR' | 'KRW';

export const EXCHANGE_RATES: Record<Currency, number> = {
  TWD: 1,
  JPY: 0.21,
  USD: 31.5,
  EUR: 34.2,
  KRW: 0.024,
};

export interface UserProfile {
  name: string;
  avatar: string;
}
