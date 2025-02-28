
import { useState, useEffect } from "react";

export interface Product {
  id: string;
  name: string;
  size: string; // "5", "16", "20", "25", "30", "car" for car diffuser
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

// Поддерживаемые размеры
const SUPPORTED_SIZES: Record<string, string> = {
  '5': '5',
  '5мл': '5',
  '5 мл': '5',
  '16': '16',
  '16мл': '16',
  '16 мл': '16',
  '20': '20',
  '20мл': '20',
  '20 мл': '20',
  '25': '25',
  '25мл': '25',
  '25 мл': '25',
  '30': '30',
  '30мл': '30',
  '30 мл': '30',
  'автофлакон': 'car',
  'авто флакон': 'car',
  'авто': 'car',
  'машина': 'car',
  'car': 'car',
  'car diffuser': 'car',
  'диффузор': 'car',
  'автомобильный': 'car',
};

export const useInventory = () => {
  const [inventory, setInventory] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Load inventory from local storage on initial render
  useEffect(() => {
    const storedInventory = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (storedInventory) {
      try {
        setInventory(JSON.parse(storedInventory));
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
    // Check if product already exists with same name, size, type, and location
    const existingProductIndex = inventory.findIndex(
      (p) =>
        p.name.toLowerCase() === product.name.toLowerCase() &&
        p.size === product.size &&
        p.type === product.type &&
        p.locationId === product.locationId
    );

    if (existingProductIndex >= 0) {
      // Update quantity of existing product
      const updatedInventory = [...inventory];
      updatedInventory[existingProductIndex].quantity += product.quantity;
      setInventory(updatedInventory);
    } else {
      // Add new product
      setInventory([...inventory, product]);
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
            message: `Обновлен товар "${product.name}" (${getSizeLabel(product.size)}), новое количество: ${product.quantity}`
          });
          importedCount++;
          updatedItemsCount++;
        } else {
          // Добавляем новый товар
          newInventory.push(product);
          console.log("Added new product to inventory");
          logs.push({
            type: 'success',
            message: `Добавлен новый товар "${product.name}" (${getSizeLabel(product.size)}), количество: ${product.quantity}`
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
            message: `Обнулен товар "${product.name}" (${getSizeLabel(product.size)}), отсутствует в импорте`
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
    return SUPPORTED_SIZES[normalized] || null;
  };

  // Получает читаемую метку для размера
  const getSizeLabel = (size: string): string => {
    switch (size) {
      case '5': return '5 мл';
      case '16': return '16 мл';
      case '20': return '20 мл';
      case '25': return '25 мл';
      case '30': return '30 мл';
      case 'car': return 'Автофлакон';
      default: return size;
    }
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
      
      // Получаем заголовки и пытаемся найти важные колонки
      const headers = lines[0].split(separator).map(h => h.trim());
      console.log("Headers detected:", headers);
      
      // Ищем индексы нужных колонок
      const nameIndex = findColumnIndex(headers, [
        'название', 'наименование', 'товар', 'продукт', 'name', 'product', 'title', 'item'
      ]);
      
      const sizeIndex = findColumnIndex(headers, [
        'объем', 'размер', 'size', 'volume', 'capacity'
      ]);
      
      const quantityIndex = findColumnIndex(headers, [
        'количество', 'остаток', 'кол-во', 'колво', 'число', 'штук', 'quantity', 'amount', 'count', 'qty', 'pcs'
      ]);
      
      console.log("Column indices:", { nameIndex, quantityIndex, sizeIndex });
      
      // Проверяем, нашли ли мы необходимые колонки
      const logs: ImportLogItem[] = [];
      
      if (nameIndex === -1) {
        logs.push({
          type: 'error',
          message: 'Не удалось найти колонку с названием товара'
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
      
      if (sizeIndex === -1) {
        logs.push({
          type: 'warning',
          message: 'Не удалось найти колонку с объемом, будет использоваться значение по умолчанию (5 мл)'
        });
      }
      
      if (quantityIndex === -1) {
        logs.push({
          type: 'error',
          message: 'Не удалось найти колонку с количеством товара'
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
      
      // Парсим каждую строку
      const products: Omit<Product, "id">[] = [];
      
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        const columns = line.split(separator).map(col => col.trim());
        
        // Пропускаем строки, у которых недостаточно колонок
        if (columns.length <= Math.max(nameIndex, quantityIndex, sizeIndex !== -1 ? sizeIndex : 0)) {
          logs.push({
            type: 'warning',
            message: `Пропущена строка ${i+1}: недостаточно колонок`
          });
          continue;
        }
        
        const name = columns[nameIndex];
        if (!name) {
          logs.push({
            type: 'warning',
            message: `Пропущена строка ${i+1}: отсутствует название товара`
          });
          continue;
        }
        
        // Определяем размер
        let size = '5'; // Размер по умолчанию
        if (sizeIndex !== -1 && columns[sizeIndex]) {
          const normalizedSize = normalizeSize(columns[sizeIndex]);
          if (normalizedSize) {
            size = normalizedSize;
          } else {
            logs.push({
              type: 'warning',
              message: `Пропущена строка ${i+1}: неподдерживаемый размер "${columns[sizeIndex]}"`
            });
            continue;
          }
        }
        
        // Парсим количество
        const quantityText = columns[quantityIndex].replace(/[^\d.,]/g, '').replace(',', '.');
        const quantity = parseFloat(quantityText);
        
        if (isNaN(quantity) || quantity <= 0) {
          logs.push({
            type: 'warning',
            message: `Пропущена строка ${i+1}: некорректное количество "${columns[quantityIndex]}"`
          });
          continue;
        }
        
        // Добавляем продукт в список для импорта
        products.push({
          name,
          size,
          type: 'perfume', // Тип по умолчанию
          locationId,
          quantity
        });
      }
      
      console.log(`Found ${products.length} products to import`);
      
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

  // Находит наиболее вероятный индекс колонки на основе вариаций заголовка
  const findColumnIndex = (headers: string[], variations: string[]): number => {
    for (const header of headers) {
      const normalizedHeader = normalizeText(header);
      for (const variation of variations) {
        if (normalizedHeader.includes(normalizeText(variation))) {
          return headers.indexOf(header);
        }
      }
    }
    return -1;
  };

  // Нормализует текст для лучшего сопоставления
  const normalizeText = (text: string): string => {
    return text.toLowerCase()
      .replace(/\s+/g, '')
      .replace(/[^\w\s]/gi, '');
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
  };
};
