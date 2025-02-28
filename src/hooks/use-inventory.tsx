
import { useState, useEffect } from "react";

export interface Product {
  id: string;
  name: string;
  size: string; // "5", "16", "20", "25", "30", "car" for car diffuser
  type: string; // "perfume", "other"
  locationId: string;
  quantity: number;
}

const LOCAL_STORAGE_KEY = "scenttrack-inventory";

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

  // Bulk import products from data
  const importProducts = (products: Omit<Product, "id">[]) => {
    if (!products || products.length === 0) {
      return 0;
    }
    
    const newInventory = [...inventory];
    
    products.forEach(productData => {
      if (!productData.name || !productData.locationId) {
        console.log("Skipping invalid product:", productData);
        return;
      }
      
      // Create full product with ID
      const product: Product = {
        ...productData,
        id: Date.now().toString() + Math.random().toString(36).substring(2, 9)
      };
      
      // Check if product already exists
      const existingProductIndex = newInventory.findIndex(
        (p) =>
          p.name.toLowerCase() === product.name.toLowerCase() &&
          p.size === product.size &&
          p.type === product.type &&
          p.locationId === product.locationId
      );

      if (existingProductIndex >= 0) {
        // Update quantity of existing product
        newInventory[existingProductIndex].quantity = product.quantity;
      } else {
        // Add new product
        newInventory.push(product);
      }
    });

    setInventory(newInventory);
    return newInventory.length;
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

  // Get products for a specific location
  const getProductsByLocation = (locationId: string) => {
    return inventory.filter((product) => product.locationId === locationId);
  };

  return {
    inventory,
    loading,
    addProduct,
    importProducts,
    updateProductQuantity,
    updateProduct,
    deleteProduct,
    getProductsByLocation,
  };
};
