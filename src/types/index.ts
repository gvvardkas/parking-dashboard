export interface Spot {
  id: string;
  venmo: string;
  email: string;
  phone: string;
  spotNumber: string;
  availableFrom: string;
  availableTo: string;
  pricePerDay: number;
  status: 'available' | 'rented';
  pin: string;
  size: 'Full Size' | 'Compact' | 'Motorcycle';
  floor: 'P1' | 'P2' | 'P3';
  notes: string;
}

export interface RenterInfo {
  name: string;
  email: string;
  phone: string;
  screenshot?: string | null;
}

export interface RentalData {
  fromDate: string;
  fromTime: string;
  toDate: string;
  toTime: string;
  name: string;
  email: string;
  phone: string;
  screenshot: string | null;
  screenshotPreview: string | null;
}

export interface Session {
  code: string;
  version: number;
  timestamp: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  error?: string;
  data?: T;
}

export interface ValidateAccessResponse {
  success: boolean;
  version?: number;
  error?: string;
}

export interface CheckSessionResponse {
  valid: boolean;
}

export interface AddSpotResponse {
  success: boolean;
  id?: string;
  error?: string;
}

export interface VerifyPinResponse {
  success: boolean;
  error?: string;
}

export interface UpdateSpotResponse {
  success: boolean;
  error?: string;
}

export interface DeleteSpotResponse {
  success: boolean;
  error?: string;
}

export interface RentSpotResponse {
  success: boolean;
  spotNumber?: string;
  ownerPhone?: string;
  error?: string;
}

export interface FetchSpotsResponse {
  spots: Spot[];
}

export interface AddSpotFormData {
  venmo: string;
  email: string;
  phone: string;
  spotNumber: string;
  size: 'Full Size' | 'Compact' | 'Motorcycle';
  floor: 'P1' | 'P2' | 'P3';
  notes: string;
  fromDate: string;
  fromTime: string;
  toDate: string;
  toTime: string;
  pricePerDay: number;
  pin: string;
}

export interface ManageSpotFormData {
  venmo: string;
  email: string;
  phone: string;
  spotNumber: string;
  size: 'Full Size' | 'Compact' | 'Motorcycle';
  floor: 'P1' | 'P2' | 'P3';
  fromDate: string;
  fromTime: string;
  toDate: string;
  toTime: string;
  pricePerDay: number;
}

export interface Filters {
  date: string;
  venmo: string;
  size: string;
  floor: string;
}

export type SortBy = 'random' | 'soonest' | 'longest';
