
import { useState, useEffect } from "react";

export interface Location {
  id: string;
  name: string;
  address?: string;
  contact?: string;
}

const LOCAL_STORAGE_KEY = "scenttrack-locations";

// Примеры точек продаж по умолчанию (на случай если localStorage пуст)
const DEFAULT_LOCATIONS: Location[] = [
  {
    id: "1",
    name: "Центральный магазин",
    address: "ул. Центральная, 123",
    contact: "+7 (999) 123-45-67",
  },
  {
    id: "2",
    name: "ТЦ Галерея",
    address: "пр. Ленина, 45",
    contact: "+7 (999) 987-65-43",
  },
];

export const useLocations = () => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  // Загрузка точек продаж из localStorage при первом рендере
  useEffect(() => {
    try {
      // Обеспечиваем выполнение только на клиенте
      if (typeof window !== 'undefined') {
        const storedLocations = localStorage.getItem(LOCAL_STORAGE_KEY);
        console.log("Загруженные данные из localStorage:", storedLocations);
        
        if (storedLocations) {
          try {
            const parsedLocations = JSON.parse(storedLocations);
            if (Array.isArray(parsedLocations) && parsedLocations.length > 0) {
              setLocations(parsedLocations);
              console.log("Точки продаж успешно загружены:", parsedLocations);
            } else {
              // Если массив пустой или не массив, используем значения по умолчанию
              console.log("Данные из localStorage пусты или недействительны, используем значения по умолчанию");
              setLocations(DEFAULT_LOCATIONS);
              // Сохраняем значения по умолчанию в localStorage
              localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(DEFAULT_LOCATIONS));
            }
          } catch (parseError) {
            console.error("Ошибка при парсинге данных из localStorage:", parseError);
            setLocations(DEFAULT_LOCATIONS);
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(DEFAULT_LOCATIONS));
          }
        } else {
          // Если в localStorage нет данных, используем значения по умолчанию
          console.log("В localStorage нет данных, используем значения по умолчанию");
          setLocations(DEFAULT_LOCATIONS);
          // Сохраняем значения по умолчанию
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(DEFAULT_LOCATIONS));
        }
      }
    } catch (error) {
      console.error("Ошибка при загрузке точек продаж:", error);
      // В случае ошибки, используем значения по умолчанию и сохраняем их
      setLocations(DEFAULT_LOCATIONS);
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(DEFAULT_LOCATIONS));
      } catch (storageError) {
        console.error("Не удалось сохранить точки продаж в localStorage:", storageError);
      }
    } finally {
      setLoading(false);
      setInitialized(true);
    }
  }, []);

  // Сохранение точек продаж в localStorage при их изменении
  useEffect(() => {
    // Сохраняем только если компонент инициализирован и не в состоянии загрузки
    if (!loading && initialized && typeof window !== 'undefined') {
      try {
        console.log("Сохранение точек продаж:", locations);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(locations));
      } catch (error) {
        console.error("Ошибка при сохранении точек продаж:", error);
      }
    }
  }, [locations, loading, initialized]);

  // Добавление новой точки
  const addLocation = (location: Location) => {
    console.log("Добавление точки:", location);
    setLocations(prevLocations => {
      const newLocations = [...prevLocations, location];
      // Немедленно сохраняем в localStorage
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newLocations));
        } catch (error) {
          console.error("Ошибка при сохранении после добавления:", error);
        }
      }
      return newLocations;
    });
  };

  // Обновление точки
  const updateLocation = (updatedLocation: Location) => {
    console.log("Обновление точки:", updatedLocation);
    setLocations(prevLocations => {
      const updatedLocations = prevLocations.map((location) =>
        location.id === updatedLocation.id ? updatedLocation : location
      );
      // Немедленно сохраняем в localStorage
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedLocations));
        } catch (error) {
          console.error("Ошибка при сохранении после обновления:", error);
        }
      }
      return updatedLocations;
    });
  };

  // Удаление точки
  const deleteLocation = (locationId: string) => {
    console.log("Удаление точки с ID:", locationId);
    setLocations(prevLocations => {
      const updatedLocations = prevLocations.filter(
        (location) => location.id !== locationId
      );
      // Немедленно сохраняем в localStorage
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedLocations));
        } catch (error) {
          console.error("Ошибка при сохранении после удаления:", error);
        }
      }
      return updatedLocations;
    });
  };

  // Получение точки по ID
  const getLocationById = (locationId: string) => {
    return locations.find((location) => location.id === locationId);
  };

  // Экспорт данных
  const exportLocations = () => {
    return JSON.stringify(locations);
  };

  // Импорт данных
  const importLocations = (jsonData: string) => {
    try {
      const parsedData = JSON.parse(jsonData);
      if (Array.isArray(parsedData)) {
        setLocations(parsedData);
        if (typeof window !== 'undefined') {
          localStorage.setItem(LOCAL_STORAGE_KEY, jsonData);
        }
        return { success: true, message: "Данные точек продаж успешно импортированы" };
      }
      return { success: false, message: "Неверный формат данных" };
    } catch (error) {
      console.error("Ошибка при импорте точек продаж:", error);
      return { success: false, message: "Ошибка при импорте данных" };
    }
  };

  return {
    locations,
    loading,
    addLocation,
    updateLocation,
    deleteLocation,
    getLocationById,
    exportLocations,
    importLocations,
  };
};
