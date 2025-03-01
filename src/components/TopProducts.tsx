
import { useMemo } from "react";
import { subDays, isAfter } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package } from "lucide-react";
import { useSales } from "@/hooks/use-sales";
import { Progress } from "@/components/ui/progress";

interface TopProductsProps {
  locationId?: string;
  limit?: number;
}

export const TopProducts = ({ locationId = "all", limit = 5 }: TopProductsProps) => {
  const { sales } = useSales();
  
  // Получаем топ-продукты
  const topProducts = useMemo(() => {
    const productMap = new Map<string, { 
      name: string, 
      revenue: number,
      quantity: number,
      sizes: Map<string, number>
    }>();
    
    // Продажи за последние 30 дней
    const thirtyDaysAgo = subDays(new Date(), 30);
    const recentSales = sales.filter(sale => 
      isAfter(new Date(sale.date), thirtyDaysAgo) && 
      (locationId === "all" || sale.locationId === locationId)
    );
    
    // Обрабатываем данные о продажах
    recentSales.forEach(sale => {
      sale.items.forEach(item => {
        const key = item.name;
        const sizeKey = item.size;
        
        // Если продукт еще не в Map, добавляем его
        if (!productMap.has(key)) {
          productMap.set(key, { 
            name: key, 
            revenue: 0, 
            quantity: 0,
            sizes: new Map()
          });
        }
        
        // Обновляем данные о продукте
        const product = productMap.get(key)!;
        product.revenue += (item.price || 0) * item.quantity;
        product.quantity += item.quantity;
        
        // Обновляем данные о размерах
        const sizeCount = product.sizes.get(sizeKey) || 0;
        product.sizes.set(sizeKey, sizeCount + item.quantity);
      });
    });
    
    // Сортируем продукты по выручке и берем топ-N
    return Array.from(productMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, limit)
      .map((product, index) => {
        // Находим наиболее популярный размер
        let popularSize = "";
        let maxQuantity = 0;
        
        for (const [size, qty] of product.sizes.entries()) {
          if (qty > maxQuantity) {
            maxQuantity = qty;
            popularSize = size;
          }
        }
        
        // Форматируем размер для отображения
        const formattedSize = popularSize.includes("мл") 
          ? popularSize
          : popularSize === "Автофлакон" 
            ? "Автофлакон" 
            : `${popularSize} мл`;
        
        return {
          ...product,
          popularSize: formattedSize,
          index,
        };
      });
  }, [sales, locationId, limit]);
  
  // Если нет данных, не показываем компонент
  if (topProducts.length === 0) {
    return null;
  }
  
  // Находим максимальную выручку для расчета процентов
  const maxRevenue = Math.max(...topProducts.map(p => p.revenue));

  return (
    <Card className="mt-6">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Package className="h-5 w-5 text-brand-gold" />
          ТОП-{limit} ароматов {locationId !== "all" ? "в этой точке" : "по всей сети"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {topProducts.map(product => {
            const progressPercent = (product.revenue / maxRevenue) * 100;
            
            return (
              <div key={product.name} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="font-medium flex items-center gap-2">
                    {product.name}
                    <Badge variant="outline">{product.popularSize}</Badge>
                  </div>
                  <div className="text-sm font-medium">
                    {new Intl.NumberFormat('ru-RU').format(product.revenue)} ₽
                  </div>
                </div>
                <Progress 
                  value={progressPercent} 
                  className="h-2"
                  style={
                    {
                      "--progress-from": `hsl(${39 - product.index * 30}, 95%, 50%)`,
                      "--progress-to": `hsl(${39 - product.index * 30}, 95%, 65%)`
                    } as React.CSSProperties
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Продано: {product.quantity} шт.
                </p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
