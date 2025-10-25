import { useEffect, useState } from 'react';

const TOUR_STORAGE_KEY = 'smart_travel_tour_data';

export interface TourStorageData {
  // Flight booking data
  city_id?: string;
  departure?: string;
  destination?: string;
  departureDate?: string;
  arrivalDate?: string;
  startDate?: string; // New: ISO format date (YYYY-MM-DD)
  endDate?: string;   // New: ISO format date (YYYY-MM-DD)
  budget?: number;
  adults?: number;
  children?: number;
  infants?: number;
  passengers?: number;
  days?: number;
  moneyFlight?: number;

  // Flight selections
  selectedDepartureFlight?: any;
  selectedReturnFlight?: any;

  // Current day tracking (1-based index)
  currentDay?: number;
  
  // Preferences data per day
  dayPreferences?: {
    [day: number]: {
      preferences?: any[];
      likedItems?: any[];
      dislikedItems?: any[];
    };
  };
  
  // Schedule data per day
  daySchedules?: {
    [day: number]: any;
  };
  
  // Legacy fields (for backward compatibility)
  preferences?: any[];
  likedItems?: any[];
  dislikedItems?: any[];
  scheduleData?: any[];
  
  // Metadata
  lastUpdated?: string;
  currentStep?: 'flight' | 'preferences' | 'schedule' | 'final';
}

/**
 * Custom hook to manage tour data in localStorage
 */
export const useTourStorage = () => {
  // Initialize state with data from localStorage immediately
  const [tourData, setTourData] = useState<TourStorageData | null>(() => {
    try {
      const stored = localStorage.getItem(TOUR_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored) as TourStorageData;
      }
    } catch (error) {
      console.error('Error loading initial tour data from localStorage:', error);
    }
    return null;
  });

  /**
   * Load tour data from localStorage
   */
  const loadTourData = (): TourStorageData | null => {
    try {
      const stored = localStorage.getItem(TOUR_STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored) as TourStorageData;
        setTourData(data);
        return data;
      }
    } catch (error) {
      console.error('Error loading tour data from localStorage:', error);
    }
    return null;
  };

  /**
   * Save tour data to localStorage
   */
  const saveTourData = (data: Partial<TourStorageData>) => {
    try {
      const currentData = loadTourData() || {};
      const updatedData: TourStorageData = {
        ...currentData,
        ...data,
        lastUpdated: new Date().toISOString(),
      };
      
      localStorage.setItem(TOUR_STORAGE_KEY, JSON.stringify(updatedData));
      setTourData(updatedData);
      return updatedData;
    } catch (error) {
      console.error('Error saving tour data to localStorage:', error);
      return null;
    }
  };

  /**
   * Update specific field in tour data
   */
  const updateTourField = <K extends keyof TourStorageData>(
    field: K,
    value: TourStorageData[K]
  ) => {
    return saveTourData({ [field]: value });
  };

  /**
   * Clear all tour data from localStorage
   */
  const clearTourData = () => {
    try {
      localStorage.removeItem(TOUR_STORAGE_KEY);
      setTourData(null);
      console.log('Tour data cleared from localStorage');
    } catch (error) {
      console.error('Error clearing tour data from localStorage:', error);
    }
  };

  /**
   * Check if tour data exists
   */
  const hasTourData = (): boolean => {
    return !!localStorage.getItem(TOUR_STORAGE_KEY);
  };

  /**
   * Get specific field from tour data (without triggering state update)
   */
  const getTourField = <K extends keyof TourStorageData>(
    field: K
  ): TourStorageData[K] | undefined => {
    // Read directly from localStorage without updating state
    try {
      const stored = localStorage.getItem(TOUR_STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored) as TourStorageData;
        return data?.[field];
      }
    } catch (error) {
      console.error('Error reading tour field from localStorage:', error);
    }
    return undefined;
  };

  /**
   * Save flight booking data
   */
  const saveFlightData = (data: {
    city_id?: string;
    departure: string;
    destination: string;
    departureDate: string;
    arrivalDate: string;
    budget: number;
    adults: number;
    children?: number;
    infants?: number;
    passengers: number;
    days: number;
    moneyFlight?: number;
    selectedDepartureFlight?: any;
    selectedReturnFlight?: any;
  }) => {
    // Convert departureDate to startDate (ISO format YYYY-MM-DD)
    const departureDateTime = new Date(data.departureDate);
    const startDate = departureDateTime.toISOString().split('T')[0];
    
    // Calculate endDate based on days
    const endDate = new Date(departureDateTime);
    endDate.setDate(endDate.getDate() + data.days - 1);
    const endDateStr = endDate.toISOString().split('T')[0];
    
    return saveTourData({
      ...data,
      startDate,
      endDate: endDateStr,
      currentStep: 'flight',
    });
  };

  /**
   * Get date for a specific day (0-based index means day 1, day 2, etc.)
   * Returns date in format: "Thursday, October 16, 2025"
   */
  const getDateForDay = (dayNumber: number): string => {
    try {
      const stored = localStorage.getItem(TOUR_STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored) as TourStorageData;
        if (data?.startDate) {
          const startDate = new Date(data.startDate);
          const targetDate = new Date(startDate);
          targetDate.setDate(targetDate.getDate() + (dayNumber - 1));
          
          return targetDate.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          });
        }
      }
    } catch (error) {
      console.error('Error calculating date for day:', error);
    }
    return '';
  };

  /**
   * Get ISO date string for a specific day (YYYY-MM-DD)
   */
  const getIsoDateForDay = (dayNumber: number): string => {
    try {
      const stored = localStorage.getItem(TOUR_STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored) as TourStorageData;
        if (data?.startDate) {
          const startDate = new Date(data.startDate);
          const targetDate = new Date(startDate);
          targetDate.setDate(targetDate.getDate() + (dayNumber - 1));
          
          return targetDate.toISOString().split('T')[0];
        }
      }
    } catch (error) {
      console.error('Error calculating ISO date for day:', error);
    }
    return '';
  };

  /**
   * Save preferences data (legacy - saves to root level)
   */
  const savePreferencesData = (data: {
    preferences: any[];
    likedItems: any[];
    dislikedItems: any[];
  }) => {
    return saveTourData({
      ...data,
      currentStep: 'preferences',
    });
  };

  /**
   * Save preferences for a specific day
   */
  const saveDayPreferences = (day: number, data: {
    preferences: any[];
    likedItems: any[];
    dislikedItems: any[];
  }) => {
    const currentData = loadTourData() || {};
    const dayPreferences = currentData.dayPreferences || {};
    
    return saveTourData({
      dayPreferences: {
        ...dayPreferences,
        [day]: data,
      },
      currentDay: day,
      currentStep: 'preferences',
    });
  };

  /**
   * Get preferences for a specific day (without triggering state update)
   */
  const getDayPreferences = (day: number) => {
    // Read directly from localStorage without updating state
    try {
      const stored = localStorage.getItem(TOUR_STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored) as TourStorageData;
        return data?.dayPreferences?.[day];
      }
    } catch (error) {
      console.error('Error reading day preferences from localStorage:', error);
    }
    return undefined;
  };

  /**
   * Save schedule data (legacy - saves all schedules to root level)
   */
  const saveScheduleData = (data: {
    scheduleData: any[];
  }) => {
    return saveTourData({
      ...data,
      currentStep: 'schedule',
    });
  };

  /**
   * Save schedule for a specific day
   */
  const saveDaySchedule = (day: number, scheduleData: any) => {
    const currentData = loadTourData() || {};
    const daySchedules = currentData.daySchedules || {};
    
    return saveTourData({
      daySchedules: {
        ...daySchedules,
        [day]: scheduleData,
      },
      currentStep: 'schedule',
    });
  };

  /**
   * Get schedule for a specific day (without triggering state update)
   */
  const getDaySchedule = (day: number) => {
    // Read directly from localStorage without updating state
    try {
      const stored = localStorage.getItem(TOUR_STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored) as TourStorageData;
        return data?.daySchedules?.[day];
      }
    } catch (error) {
      console.error('Error reading day schedule from localStorage:', error);
    }
    return undefined;
  };

  /**
   * Get all day schedules (without triggering state update)
   */
  const getAllDaySchedules = () => {
    // Read directly from localStorage without updating state
    try {
      const stored = localStorage.getItem(TOUR_STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored) as TourStorageData;
        return data?.daySchedules || {};
      }
    } catch (error) {
      console.error('Error reading day schedules from localStorage:', error);
    }
    return {};
  };

  /**
   * Check if all days have schedules (without triggering state update)
   */
  const areAllDaysComplete = (): boolean => {
    // Read directly from localStorage without updating state
    try {
      const stored = localStorage.getItem(TOUR_STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored) as TourStorageData;
        const totalDays = data?.days || 0;
        const daySchedules = data?.daySchedules || {};
        
        for (let i = 1; i <= totalDays; i++) {
          if (!daySchedules[i]) return false;
        }
        
        return totalDays > 0;
      }
    } catch (error) {
      console.error('Error checking completion status from localStorage:', error);
    }
    return false;
  };

  /**
   * Get current step
   */
  const getCurrentStep = (): TourStorageData['currentStep'] => {
    return getTourField('currentStep') || 'flight';
  };

  /**
   * Export tour data as JSON
   */
  const exportTourData = (): string => {
    const data = loadTourData();
    return JSON.stringify(data, null, 2);
  };

  /**
   * Import tour data from JSON
   */
  const importTourData = (jsonString: string): boolean => {
    try {
      const data = JSON.parse(jsonString) as TourStorageData;
      saveTourData(data);
      return true;
    } catch (error) {
      console.error('Error importing tour data:', error);
      return false;
    }
  };

  return {
    tourData,
    loadTourData,
    saveTourData,
    updateTourField,
    clearTourData,
    hasTourData,
    getTourField,
    saveFlightData,
    savePreferencesData,
    saveDayPreferences,
    getDayPreferences,
    saveScheduleData,
    saveDaySchedule,
    getDaySchedule,
    getAllDaySchedules,
    areAllDaysComplete,
    getCurrentStep,
    exportTourData,
    importTourData,
    getDateForDay,
    getIsoDateForDay,
  };
};

/**
 * Standalone functions (can be used without hook)
 */
export const TourStorage = {
  load: (): TourStorageData | null => {
    try {
      const stored = localStorage.getItem(TOUR_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  },

  save: (data: Partial<TourStorageData>): void => {
    try {
      const current = TourStorage.load() || {};
      const updated = {
        ...current,
        ...data,
        lastUpdated: new Date().toISOString(),
      };
      localStorage.setItem(TOUR_STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Error saving tour data:', error);
    }
  },

  clear: (): void => {
    try {
      localStorage.removeItem(TOUR_STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing tour data:', error);
    }
  },

  has: (): boolean => {
    return !!localStorage.getItem(TOUR_STORAGE_KEY);
  },
};

