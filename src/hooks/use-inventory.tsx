import { useState, useEffect } from "react";

export interface Product {
  id: string;
  name: string;
  size: string; // "5 мл", "16 мл", "20 мл", "25 мл", "30 мл", "Автофлакон"
  type: string; // "perfume", "other"
  locationId: string;
  quantity: number;
  price?: number; // Optional price field
}

// Типы для логирования операций импорта
export interface ImportLogItem {
  type: 'success' | 'warning' | 'error';
  message: string;
  details?: any;
}

export interface ImportResult {
  importedCount: number;
  skippedCount: number;
  newItemsCount: number;
  updatedItemsCount: number;
  zeroedItemsCount: number;
  logs: ImportLogItem[];
}

const LOCAL_STORAGE_KEY = "scenttrack-inventory";

// Поддерживаемые размеры (обновлены в соответствии с требованиями)
const SUPPORTED_SIZES: Record<string, string> = {
  '5': '5 мл',
  '5мл': '5 мл',
  '5 мл': '5 мл',
  '16': '16 мл',
  '16мл': '16 мл',
  '16 мл': '16 мл',
  '20': '20 мл',
  '20мл': '20 мл',
  '20 мл': '20 мл',
  '25': '25 мл',
  '25мл': '25 мл',
  '25 мл': '25 мл',
  '30': '30 мл',
  '30мл': '30 мл',
  '30 мл': '30 мл',
  'автофлакон': 'Автофлакон',
  'авто флакон': 'Автофлакон',
  'авто': 'Автофлакон',
  'машина': 'Автофлакон',
  'car': 'Автофлакон',
  'car diffuser': 'Автофлакон',
  'диффузор': 'Автофлакон',
  'автомобильный': 'Автофлакон',
};

// Обратное сопоставление для статистики
const SIZE_TO_STAT_KEY: Record<string, string> = {
  '5 мл': '5',
  '16 мл': '16',
  '20 мл': '20',
  '25 мл': '25',
  '30 мл': '30',
  'Автофлакон': 'car',
  'car': 'car', // для обратной совместимости
  '5': '5',     // для обратной совместимости
  '16': '16',   // для обратной совместимости
  '20': '20',   // для обратной совместимости
  '25': '25',   // для обратной совместимости
  '30': '30',   // для обратной совместимости
};

// Валидные размеры, которые поддерживаются системой
const VALID_SIZES = ["5 мл", "16 мл", "20 мл", "25 мл", "30 мл", "Автофлакон"];

export const useInventory = () => {
  const [inventory, setInventory] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Load inventory from local storage on initial render
  useEffect(() => {
    const storedInventory = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (storedInventory) {
      try {
        // При загрузке нормализуем все размеры
        const parsedInventory = JSON.parse(storedInventory);
        const normalizedInventory = parsedInventory.map((product: Product) => {
          // Проверяем, нужно ли нормализовать размер
          if (!VALID_SIZES.includes(product.size)) {
            // Пытаемся нормализовать размер
            const normalizedSize = normalizeSize(product.size);
            if (normalizedSize) {
              return { ...product, size: normalizedSize };
            }
          }
          return product;
        });
        
        setInventory(normalizedInventory);
      } catch (error) {
        console.error("Error parsing inventory data:", error);
      }
    }
    setLoading(false);
  }, []);

  // Save inventory to local storage whenever it changes
  useEffect(() => {
    if (!loading) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(inventory));
    }
  }, [inventory, loading]);

  // Add a new product to inventory
  const addProduct = (product: Product) => {
    // Нормализуем размер перед добавлением
    const normalizedSize = normalizeSize(product.size) || product.size;
    const productWithNormalizedSize = { ...product, size: normalizedSize };
    
    // Check if product already exists with same name, size, type, and location
    const existingProductIndex = inventory.findIndex(
      (p) =>
        p.name.toLowerCase() === productWithNormalizedSize.name.toLowerCase() &&
        p.size === productWithNormalizedSize.size &&
        p.type === productWithNormalizedSize.type &&
        p.locationId === productWithNormalizedSize.locationId
    );

    if (existingProductIndex >= 0) {
      // Update quantity of existing product
      const updatedInventory = [...inventory];
      updatedInventory[existingProductIndex].quantity += productWithNormalizedSize.quantity;
      setInventory(updatedInventory);
    } else {
      // Add new product
      setInventory([...inventory, productWithNormalizedSize]);
    }
  };

  /**
   * Импортирует товары из массива данных с обновлением существующих и добавлением новых
   * @param products Массив товаров для импорта
   * @param locationId ID локации, для которой выполняется импорт
   * @param zeroNonExisting Обнулять ли остатки товаров, которых нет в импорте
   * @returns Результат операции импорта с логами
   */
  const importProducts = (
    products: Omit<Product, "id">[],
    locationId?: string,
    zeroNonExisting: boolean = false
  ): ImportResult => {
    console.log("Starting import with", products.length, "products");
    
    if (!products || products.length === 0) {
      return {
        importedCount: 0,
        skippedCount: 0,
        newItemsCount: 0,
        updatedItemsCount: 0,
        zeroedItemsCount: 0,
        logs: [{
          type: 'error',
          message: 'Нет товаров для импорта'
        }]
      };
    }
    
    const newInventory = [...inventory];
    let importedCount = 0;
    let skippedCount = 0;
    let newItemsCount = 0;
    let updatedItemsCount = 0;
    let zeroedItemsCount = 0;
    const logs: ImportLogItem[] = [];
    
    // Создаем карту продуктов, которые нужно обнулить (если включена опция zeroNonExisting)
    // Ключ - комбинация названия, размера и локации
    const productsToZero = new Map<string, Product>();
    
    if (zeroNonExisting && locationId) {
      // Собираем все продукты из текущей локации для возможного обнуления
      inventory.forEach(product => {
        if (product.locationId === locationId && product.quantity > 0) {
          const key = `${product.name.toLowerCase()}_${product.size}_${product.locationId}`;
          productsToZero.set(key, product);
        }
      });
      
      console.log(`Found ${productsToZero.size} products that might need to be zeroed`);
    }
    
    // Обрабатываем каждый продукт из импорта
    for (let i = 0; i < products.length; i++) {
      try {
        const productData = products[i];
        
        // Проверяем обязательные поля
        if (!productData.name || !productData.locationId) {
          logs.push({
            type: 'warning',
            message: `Пропущена строка ${i+1}: отсутствует название или локация`,
            details: productData
          });
          skippedCount++;
          continue;
        }
        
        // Нормализуем размер
        const normalizedSize = normalizeSize(productData.size);
        if (!normalizedSize) {
          logs.push({
            type: 'warning',
            message: `Пропущена строка ${i+1}: неподдерживаемый размер "${productData.size}"`,
            details: productData
          });
          skippedCount++;
          continue;
        }
        
        // Проверяем и преобразуем количество
        let quantity = 0;
        if (typeof productData.quantity === 'string') {
          // Извлекаем числа из строки, обрабатывая и точку, и запятую как десятичный разделитель
          const cleanQuantity = String(productData.quantity)
            .replace(/[^\d.,]/g, '')  // Удаляем все, кроме цифр, точек и запятых
            .replace(/,/g, '.');      // Заменяем запятые на точки
          
          quantity = parseInt(cleanQuantity, 10) || 0;
        } else {
          quantity = Number(productData.quantity) || 0;
        }
        
        // Пропускаем товары с некорректным количеством
        if (isNaN(quantity) || quantity <= 0) {
          logs.push({
            type: 'warning',
            message: `Пропущена строка ${i+1}: некорректное количество "${productData.quantity}"`,
            details: productData
          });
          skippedCount++;
          continue;
        }
        
        // Создаем полный продукт с ID
        const product: Product = {
          ...productData,
          id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
          size: normalizedSize,
          quantity: quantity
        };
        
        console.log("Processing product:", product.name, "size:", product.size, "quantity:", product.quantity);
        
        // Если включена опция обнуления, удаляем этот товар из списка для обнуления
        if (zeroNonExisting && locationId) {
          const key = `${product.name.toLowerCase()}_${product.size}_${product.locationId}`;
          productsToZero.delete(key);
        }
        
        // Проверяем, существует ли товар уже
        const existingProductIndex = newInventory.findIndex(
          (p) =>
            p.name.toLowerCase() === product.name.toLowerCase() &&
            p.size === product.size &&
            p.type === product.type &&
            p.locationId === product.locationId
        );

        if (existingProductIndex >= 0) {
          // Обновляем количество существующего товара
          newInventory[existingProductIndex].quantity = product.quantity;
          console.log("Updated existing product, new quantity:", newInventory[existingProductIndex].quantity);
          logs.push({
            type: 'success',
            message: `Обновлен товар "${product.name}" (${product.size}), новое количество: ${product.quantity}`
          });
          importedCount++;
          updatedItemsCount++;
        } else {
          // Добавляем новый товар
          newInventory.push(product);
          console.log("Added new product to inventory");
          logs.push({
            type: 'success',
            message: `Добавлен новый товар "${product.name}" (${product.size}), количество: ${product.quantity}`
          });
          importedCount++;
          newItemsCount++;
        }
      } catch (error) {
        console.error("Error processing product at index", i, ":", error);
        logs.push({
          type: 'error',
          message: `Ошибка обработки строки ${i+1}`,
          details: error
        });
        skippedCount++;
      }
    }

    // Обнуляем товары, которых не было в импорте
    if (zeroNonExisting && locationId && productsToZero.size > 0) {
      console.log(`Zeroing ${productsToZero.size} products that were not in the import`);
      
      for (const product of productsToZero.values()) {
        const productIndex = newInventory.findIndex(p => p.id === product.id);
        if (productIndex >= 0) {
          newInventory[productIndex].quantity = 0;
          logs.push({
            type: 'warning',
            message: `Обнулен товар "${product.name}" (${product.size}), отсутствует в импорте`
          });
          zeroedItemsCount++;
        }
      }
    }

    console.log("Import completed, total products imported:", importedCount);
    setInventory(newInventory);
    
    return {
      importedCount,
      skippedCount,
      newItemsCount,
      updatedItemsCount,
      zeroedItemsCount,
      logs
    };
  };

  // Нормализует размер в стандартный формат
  const normalizeSize = (size: string | undefined): string | null => {
    if (!size) return null;
    
    const normalized = size.toString().toLowerCase().trim();
    const result = SUPPORTED_SIZES[normalized];
    
    // Проверяем, что размер входит в список валидных размеров
    if (result && VALID_SIZES.includes(result)) {
      return result;
    }
    
    return null;
  };

  // Получает ключ для статистики по размеру товара
  const getSizeStatKey = (size: string): string => {
    return SIZE_TO_STAT_KEY[size] || size;
  };

  /**
   * Импортирует товары из CSV-строки
   * @param csvString CSV-строка с данными
   * @param locationId ID локации для импорта
   * @param zeroNonExisting Обнулять ли товары, отсутствующие в импорте
   * @returns Результат операции импорта
   */
  const importFromCSV = (
    csvString: string,
    locationId: string,
    zeroNonExisting: boolean = false
  ): ImportResult => {
    try {
      console.log("Starting to parse CSV data");
      
      if (!csvString || !csvString.trim()) {
        return {
          importedCount: 0,
          skippedCount: 0,
          newItemsCount: 0,
          updatedItemsCount: 0,
          zeroedItemsCount: 0,
          logs: [{
            type: 'error',
            message: 'Пустой CSV-файл'
          }]
        };
      }
      
      // Обнаруживаем и разделяем данные
      const lines = csvString.trim().split(/\r?\n/);
      
      if (lines.length <= 1) {
        return {
          importedCount: 0,
          skippedCount: 0,
          newItemsCount: 0,
          updatedItemsCount: 0,
          zeroedItemsCount: 0,
          logs: [{
            type: 'error',
            message: 'Файл пуст или содержит только заголовок'
          }]
        };
      }
      
      // Определяем разделитель
      let separator = ',';
      if (lines[0].includes('\t')) separator = '\t';
      else if (lines[0].includes(';')) separator = ';';
      
      console.log("Using separator:", separator);
      
      // Получаем заголовки и выводим их для отладки
      const headers = lines[0].split(separator).map(h => h.trim());
      console.log("Headers detected:", headers);
      
      // Ищем нужные колонки по точным названиям (в соответствии с требованиями)
      const nameColumnIndex = headers.findIndex(h => 
        h.toLowerCase() === 'название' || 
        h.toLowerCase() === 'name'
      );
      
      const sizeColumnIndex = headers.findIndex(h => 
        h.toLowerCase() === 'размер' || 
        h.toLowerCase() === 'size'
      );
      
      const quantityColumnIndex = headers.findIndex(h => 
        h.toLowerCase() === 'остаток' || 
        h.toLowerCase() === 'quantity'
      );
      
      console.log("Identified column indices:", { 
        nameColumnIndex, 
        sizeColumnIndex, 
        quantityColumnIndex 
      });
      
      // Проверяем наличие всех необходимых колонок
      const logs: ImportLogItem[] = [];
      
      if (nameColumnIndex === -1) {
        logs.push({
          type: 'error',
          message: 'В файле нет колонки "Название"'
        });
        return {
          importedCount: 0,
          skippedCount: 0,
          newItemsCount: 0,
          updatedItemsCount: 0,
          zeroedItemsCount: 0,
          logs
        };
      }
      
      if (sizeColumnIndex === -1) {
        logs.push({
          type: 'error',
          message: 'В файле нет колонки "Размер"'
        });
        return {
          importedCount: 0,
          skippedCount: 0,
          newItemsCount: 0,
          updatedItemsCount: 0,
          zeroedItemsCount: 0,
          logs
        };
      }
      
      if (quantityColumnIndex === -1) {
        logs.push({
          type: 'error',
          message: 'В файле нет колонки "Остаток"'
        });
        return {
          importedCount: 0,
          skippedCount: 0,
          newItemsCount: 0,
          updatedItemsCount: 0,
          zeroedItemsCount: 0,
          logs
        };
      }
      
      // Парсим каждую строку данных
      const products: Omit<Product, "id">[] = [];
      
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        const columns = line.split(separator).map(col => col.trim());
        
        // Проверяем, что в строке достаточно колонок
        if (columns.length <= Math.max(nameColumnIndex, sizeColumnIndex, quantityColumnIndex)) {
          logs.push({
            type: 'warning',
            message: `Пропущена строка ${i+1}: недостаточно колонок`
          });
          continue;
        }
        
        // Получаем значения из соответствующих колонок
        const name = columns[nameColumnIndex];
        const sizeRaw = columns[sizeColumnIndex];
        const quantityRaw = columns[quantityColumnIndex];
        
        console.log(`Row ${i+1} data:`, { name, sizeRaw, quantityRaw });
        
        // Проверяем название
        if (!name) {
          logs.push({
            type: 'warning',
            message: `Пропущена строка ${i+1}: отсутствует название товара`
          });
          continue;
        }
        
        // Нормализуем размер
        if (!sizeRaw) {
          logs.push({
            type: 'warning',
            message: `Пропущена строка ${i+1}: отсутствует размер товара`
          });
          continue;
        }
        
        const normalizedSize = normalizeSize(sizeRaw);
        if (!normalizedSize) {
          logs.push({
            type: 'warning',
            message: `Пропущена строка ${i+1}: неподдерживаемый размер "${sizeRaw}"`
          });
          continue;
        }
        
        // Парсим количество
        if (!quantityRaw) {
          logs.push({
            type: 'warning',
            message: `Пропущена строка ${i+1}: отсутствует количество товара`
          });
          continue;
        }
        
        const quantityText = quantityRaw.replace(/[^\d.,]/g, '').replace(',', '.');
        const quantity = parseFloat(quantityText);
        
        if (isNaN(quantity) || quantity <= 0) {
          logs.push({
            type: 'warning',
            message: `Пропущена строка ${i+1}: некорректное количество "${quantityRaw}"`
          });
          continue;
        }
        
        // Добавляем продукт в список для импорта
        products.push({
          name,
          size: normalizedSize,
          type: 'perfume', // Тип по умолчанию
          locationId,
          quantity
        });
      }
      
      console.log(`Found ${products.length} valid products to import`);
      
      if (products.length === 0) {
        logs.push({
          type: 'error',
          message: 'Не удалось найти данные для импорта'
        });
        return {
          importedCount: 0,
          skippedCount: 0,
          newItemsCount: 0,
          updatedItemsCount: 0,
          zeroedItemsCount: 0,
          logs
        };
      }
      
      // Импортируем продукты
      const result = importProducts(products, locationId, zeroNonExisting);
      
      // Объединяем логи
      return {
        ...result,
        logs: [...logs, ...result.logs]
      };
      
    } catch (error) {
      console.error("Error parsing import data:", error);
      return {
        importedCount: 0,
        skippedCount: 0,
        newItemsCount: 0,
        updatedItemsCount: 0,
        zeroedItemsCount: 0,
        logs: [{
          type: 'error',
          message: error instanceof Error ? error.message : 'Произошла ошибка при импорте данных',
          details: error
        }]
      };
    }
  };

  // Update a product's quantity
  const updateProductQuantity = (productId: string, newQuantity: number) => {
    const updatedInventory = inventory.map((product) =>
      product.id === productId
        ? { ...product, quantity: newQuantity }
        : product
    );
    setInventory(updatedInventory);
  };

  // Update a product
  const updateProduct = (updatedProduct: Product) => {
    const updatedInventory = inventory.map((product) =>
      product.id === updatedProduct.id ? updatedProduct : product
    );
    setInventory(updatedInventory);
  };

  // Delete a product
  const deleteProduct = (productId: string) => {
    const updatedInventory = inventory.filter(
      (product) => product.id !== productId
    );
    setInventory(updatedInventory);
  };

  // Delete all products
  const deleteAllProducts = () => {
    setInventory([]);
  };

  // Get products for a specific location
  const getProductsByLocation = (locationId: string) => {
    return inventory.filter((product) => product.locationId === locationId);
  };

  // Export inventory data
  const exportInventory = () => {
    return JSON.stringify(inventory);
  };

  // Import inventory data
  const importInventory = (jsonData: string) => {
    try {
      const parsedData = JSON.parse(jsonData);
      if (Array.isArray(parsedData)) {
        // Normalize sizes in imported data
        const normalizedInventory = parsedData.map((product: Product) => {
          if (!VALID_SIZES.includes(product.size)) {
            const normalizedSize = normalizeSize(product.size);
            if (normalizedSize) {
              return { ...product, size: normalizedSize };
            }
          }
          return product;
        });
        
        setInventory(normalizedInventory);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(normalizedInventory));
        return { success: true, message: "Данные инвентаря успешно импортированы" };
      }
      return { success: false, message: "Неверный формат данных" };
    } catch (error) {
      console.error("Ошибка при импорте инвентаря:", error);
      return { success: false, message: "Ошибка при импорте данных" };
    }
  };

  return {
    inventory,
    loading,
    addProduct,
    importProducts,
    importFromCSV,
    updateProductQuantity,
    updateProduct,
    deleteProduct,
    deleteAllProducts,
    getProductsByLocation,
    getSizeStatKey,
    exportInventory,
    importInventory,
  };
};
