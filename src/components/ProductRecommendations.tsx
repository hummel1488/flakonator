
import { useMemo } from "react";
import { subDays, isAfter } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp } from "lucide-react";
import { useInventory } from "@/hooks/use-inventory";
import { useSales } from "@/hooks/use-sales";

interface ProductRecommendationProps {
  locationId: string;
}

export const ProductRecommendations = ({ locationId }: ProductRecommendationProps) => {
  const { inventory } = useInventory();
  const { sales } = useSales();
  
  // Если не выбрана точка, не показываем рекомендации
  if (!locationId || locationId === "all") {
    return null;
  }

  // Рассчитываем данные о продажах за последние недели для отслеживания роста
  const weeklySalesData = useMemo(() => {
    const sevenDaysAgo = subDays(new Date(), 7);
    const fourteenDaysAgo = subDays(new Date(), 14);
    
    // Продажи за последние 7 дней
    const salesLastWeek = sales.filter(sale => 
      isAfter(new Date(sale.date), sevenDaysAgo) &&
      sale.locationId === locationId
    );
    
    // Продажи за предыдущие 7 дней
    const salesPreviousWeek = sales.filter(sale => {
      const saleDate = new Date(sale.date);
      return isAfter(saleDate, fourteenDaysAgo) && 
             !isAfter(saleDate, sevenDaysAgo) &&
             sale.locationId === locationId;
    });
    
    // Анализ продаж по товарам
    const lastWeekSales = new Map<string, number>();
    const previousWeekSales = new Map<string, number>();
    
    // Обработка продаж последней недели
    salesLastWeek.forEach(sale => {
      sale.items.forEach(item => {
        const key = item.name;
        const current = lastWeekSales.get(key) || 0;
        lastWeekSales.set(key, current + (item.price || 0) * item.quantity);
      });
    });
    
    // Обработка продаж предыдущей недели
    salesPreviousWeek.forEach(sale => {
      sale.items.forEach(item => {
        const key = item.name;
        const current = previousWeekSales.get(key) || 0;
        previousWeekSales.set(key, current + (item.price || 0) * item.quantity);
      });
    });
    
    return { lastWeekSales, previousWeekSales };
  }, [sales, locationId]);

  // Извлекаем данные о продажах
  const { lastWeekSales, previousWeekSales } = weeklySalesData;

  // Получаем топ-продукты
  const topProducts = useMemo(() => {
    const dataMap = new Map<string, { 
      name: string, 
      quantity: number, 
      revenue: number, 
      growing: boolean,
      sizes: Map<string, number>
    }>();
    
    // Получаем продажи за последние 30 дней
    const thirtyDaysAgo = subDays(new Date(), 30);
    
    // Продажи за последние 30 дней
    const last30DaysSales = sales.filter(sale => 
      isAfter(new Date(sale.date), thirtyDaysAgo) &&
      sale.locationId === locationId
    );
    
    // Обрабатываем данные за 30 дней
    last30DaysSales.forEach(sale => {
      sale.items.forEach(item => {
        const existingData = dataMap.get(item.name) || { 
          name: item.name, 
          quantity: 0, 
          revenue: 0, 
          growing: false,
          sizes: new Map<string, number>()
        };
        
        // Увеличиваем количество и выручку
        existingData.quantity += item.quantity;
        existingData.revenue += (item.price || 0) * item.quantity;
        
        // Отслеживаем размеры, которые продаются
        const sizeCount = existingData.sizes.get(item.size) || 0;
        existingData.sizes.set(item.size, sizeCount + item.quantity);
        
        // Проверяем рост продаж (на основе выручки)
        const lastWeekRev = lastWeekSales.get(item.name) || 0;
        const prevWeekRev = previousWeekSales.get(item.name) || 0;
        
        if (prevWeekRev > 0 && lastWeekRev > prevWeekRev * 1.2) { // Рост более 20%
          existingData.growing = true;
        }
        
        dataMap.set(item.name, existingData);
      });
    });
    
    return Array.from(dataMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [sales, locationId, lastWeekSales, previousWeekSales]);

  // Формируем рекомендации
  const recommendations = useMemo(() => {
    const stockThreshold = 3; // Порог низкого остатка
    const result = [];
    
    for (const product of topProducts) {
      // Получаем наиболее продаваемый размер
      let bestSellingSize = "";
      let maxSold = 0;
      
      for (const [size, quantity] of product.sizes.entries()) {
        if (quantity > maxSold) {
          maxSold = quantity;
          bestSellingSize = size;
        }
      }
      
      if (!bestSellingSize) continue;
      
      // Находим товар в инвентаре
      const inventoryItem = inventory.find(
        item => 
          item.name.toLowerCase() === product.name.toLowerCase() && 
          item.size === bestSellingSize &&
          item.locationId === locationId
      );
      
      // Формируем понятный размер для отображения
      const formattedSize = bestSellingSize.includes("мл") 
        ? bestSellingSize.replace(" мл", "") 
        : bestSellingSize === "Автофлакон" ? "car" : bestSellingSize;
      
      // Создаем рекомендацию
      if (inventoryItem && inventoryItem.quantity <= stockThreshold) {
        const growthRate = previousWeekSales.get(product.name) 
          ? Math.round((lastWeekSales.get(product.name) || 0) / (previousWeekSales.get(product.name) || 1) * 100 - 100) 
          : 0;
          
        const growthMessage = product.growing 
          ? `+${growthRate}% продаж за неделю` 
          : "стабильный бестселлер, остаток ниже нормы";
          
        result.push({
          name: product.name,
          size: formattedSize === "car" ? "Автофлакон" : `${formattedSize} мл`,
          growing: product.growing,
          message: growthMessage
        });
      } else if (product.growing) {
        result.push({
          name: product.name,
          size: formattedSize === "car" ? "Автофлакон" : `${formattedSize} мл`,
          growing: true,
          message: "новая популярность среди клиентов"
        });
      }
    }
    
    return result.slice(0, 5);
  }, [topProducts, inventory, locationId, lastWeekSales, previousWeekSales]);
  
  if (recommendations.length === 0) {
    return null;
  }

  return (
    <Card className="mt-6 border-l-4 border-l-brand-gold">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <TrendingUp className="h-5 w-5 text-brand-gold" />
          Рекомендуем поставить
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {recommendations.map((recommendation, index) => (
            <li key={index} className="flex items-start gap-2">
              <Badge variant="outline" className="mt-1 min-w-16 text-center">
                {recommendation.size}
              </Badge>
              <div>
                <p className="font-medium">{recommendation.name}</p>
                <p className="text-sm text-muted-foreground">
                  {recommendation.message}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};
