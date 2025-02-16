export interface LocationData {
  // Define your location data properties here
  id?: string;
  name?: string;
  country?: string;
  city?: string;
  region?: string;
  percentage: number; // Changed from percent? to percentage as required
  count?: number;
}
