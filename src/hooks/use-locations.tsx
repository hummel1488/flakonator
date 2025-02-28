
import { useState, useEffect } from "react";

export interface Location {
  id: string;
  name: string;
  address?: string;
  contact?: string;
}

const LOCAL_STORAGE_KEY = "scenttrack-locations";

export const useLocations = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);

  // Load locations from local storage on initial render
  useEffect(() => {
    const storedLocations = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (storedLocations) {
      try {
        setLocations(JSON.parse(storedLocations));
      } catch (error) {
        console.error("Error parsing locations data:", error);
      }
    }
    setLoading(false);
  }, []);

  // Save locations to local storage whenever it changes
  useEffect(() => {
    if (!loading) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(locations));
    }
  }, [locations, loading]);

  // Add a new location
  const addLocation = (location: Location) => {
    setLocations([...locations, location]);
  };

  // Update a location
  const updateLocation = (updatedLocation: Location) => {
    const updatedLocations = locations.map((location) =>
      location.id === updatedLocation.id ? updatedLocation : location
    );
    setLocations(updatedLocations);
  };

  // Delete a location
  const deleteLocation = (locationId: string) => {
    const updatedLocations = locations.filter(
      (location) => location.id !== locationId
    );
    setLocations(updatedLocations);
  };

  // Get a location by ID
  const getLocationById = (locationId: string) => {
    return locations.find((location) => location.id === locationId);
  };

  return {
    locations,
    loading,
    addLocation,
    updateLocation,
    deleteLocation,
    getLocationById,
  };
};
