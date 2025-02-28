
import { useState, useEffect } from "react";

export interface SaleItem {
  productId: string;
  name: string;
  size: string;
  price: number;
  quantity: number;
}

export interface Sale {
  id: string;
  locationId: string;
  items: SaleItem[];
  total: number;
  date: string; // ISO string
}

const LOCAL_STORAGE_KEY = "scenttrack-sales";

export const useSales = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);

  // Load sales from local storage on initial render
  useEffect(() => {
    const storedSales = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (storedSales) {
      try {
        setSales(JSON.parse(storedSales));
      } catch (error) {
        console.error("Error parsing sales data:", error);
      }
    }
    setLoading(false);
  }, []);

  // Save sales to local storage whenever it changes
  useEffect(() => {
    if (!loading) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(sales));
    }
  }, [sales, loading]);

  // Add a new sale
  const addSale = (sale: Sale) => {
    setSales([...sales, sale]);
  };

  // Reset all sales data
  const resetSalesData = () => {
    setSales([]);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  };

  // Get sales for a specific location
  const getSalesByLocation = (locationId: string) => {
    return sales.filter((sale) => sale.locationId === locationId);
  };

  // Get sales for a specific date range
  const getSalesByDateRange = (startDate: Date, endDate: Date) => {
    return sales.filter((sale) => {
      const saleDate = new Date(sale.date);
      return saleDate >= startDate && saleDate <= endDate;
    });
  };

  // Calculate total revenue
  const getTotalRevenue = () => {
    return sales.reduce((total, sale) => total + sale.total, 0);
  };

  // Calculate revenue for a specific date range
  const getRevenueByDateRange = (startDate: Date, endDate: Date) => {
    const filteredSales = getSalesByDateRange(startDate, endDate);
    return filteredSales.reduce((total, sale) => total + sale.total, 0);
  };

  return {
    sales,
    loading,
    addSale,
    resetSalesData,
    getSalesByLocation,
    getSalesByDateRange,
    getTotalRevenue,
    getRevenueByDateRange,
  };
};
