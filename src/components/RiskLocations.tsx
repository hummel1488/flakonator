
import { useMemo } from "react";
import { format, startOfMonth, subMonths, endOfMonth } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, TrendingDown } from "lucide-react";
import { useSales } from "@/hooks/use-sales";
import { useLocations } from "@/hooks/use-locations";

interface RiskLocationsProps {
  threshold?: number;
}

export const RiskLocations = ({ threshold = 20 }: RiskLocationsProps) => {
  const { sales } = useSales();
  const { locations } = useLocations();
  
  // Рассчитываем точки с падением продаж
  const locationsWithDeclinedSales = useMemo(() => {
    const currentDate = new Date();
    const currentMonthStart = startOfMonth(currentDate);
    const currentMonthEnd = new Date(); // Сегодня
    const previousMonthStart = startOfMonth(subMonths(currentDate, 1));
    const previousMonthEnd = endOfMonth(subMonths(currentDate, 1));
    
    // Выручка по точкам за текущий месяц
    const currentMonthSales = new Map<string, number>();
    // Выручка по точкам за предыдущий месяц
    const previousMonthSales = new Map<string, number>();
    
    // Собираем данные по текущему месяцу
    sales.forEach(sale => {
      const saleDate = new Date(sale.date);
      if (saleDate >= currentMonthStart && saleDate <= currentMonthEnd) {
        const locationRevenue = currentMonthSales.get(sale.locationId) || 0;
        currentMonthSales.set(sale.locationId, locationRevenue + sale.total);
      }
    });
    
    // Собираем данные по предыдущему месяцу
    sales.forEach(sale => {
      const saleDate = new Date(sale.date);
      if (saleDate >= previousMonthStart && saleDate <= previousMonthEnd) {
        const locationRevenue = previousMonthSales.get(sale.locationId) || 0;
        previousMonthSales.set(sale.locationId, locationRevenue + sale.total);
      }
    });
    
    // Находим точки с падением продаж
    const locationsWithDecline = [];
    
    for (const [locationId, currentRevenue] of currentMonthSales.entries()) {
      const previousRevenue = previousMonthSales.get(locationId) || 0;
      
      // Если в предыдущем месяце были продажи и произошло падение
      if (previousRevenue > 0) {
        const changePercent = ((currentRevenue - previousRevenue) / previousRevenue) * 100;
        
        // Если падение больше порога
        if (changePercent <= -threshold) {
          const location = locations.find(loc => loc.id === locationId);
          if (location) {
            locationsWithDecline.push({
              id: locationId,
              name: location.name,
              currentRevenue,
              previousRevenue,
              changePercent,
            });
          }
        }
      }
    }
    
    return locationsWithDecline.sort((a, b) => a.changePercent - b.changePercent);
  }, [sales, locations, threshold]);
  
  if (locationsWithDeclinedSales.length === 0) {
    return null;
  }

  const currentMonth = format(new Date(), 'MMMM');
  const previousMonth = format(subMonths(new Date(), 1), 'MMMM');

  return (
    <Card className="mt-6 border-l-4 border-l-red-500">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <AlertTriangle className="h-5 w-5 text-red-500" />
          Точки с риском падения продаж
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {locationsWithDeclinedSales.map(location => (
            <div key={location.id} className="border-b pb-3 last:border-0 last:pb-0">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium">{location.name}</h4>
                <Badge variant="destructive" className="flex items-center gap-1">
                  <TrendingDown className="h-3 w-3" />
                  {location.changePercent.toFixed(0)}%
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <p className="text-muted-foreground">{previousMonth}:</p>
                  <p className="font-medium">{new Intl.NumberFormat('ru-RU').format(location.previousRevenue)} ₽</p>
                </div>
                <div>
                  <p className="text-muted-foreground">{currentMonth}:</p>
                  <p className="font-medium">{new Intl.NumberFormat('ru-RU').format(location.currentRevenue)} ₽</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
