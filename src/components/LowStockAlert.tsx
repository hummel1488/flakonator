
import { useMemo } from "react";
import { useInventory } from "@/hooks/use-inventory";
import { useLocations } from "@/hooks/use-locations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface LowStockAlertProps {
  locationId?: string;
  threshold?: number;
}

export const LowStockAlert = ({ locationId, threshold = 3 }: LowStockAlertProps) => {
  const navigate = useNavigate();
  const { inventory } = useInventory();
  const { locations } = useLocations();

  const lowStockItems = useMemo(() => {
    return inventory.filter(item => {
      if (locationId && item.locationId !== locationId) return false;
      return item.quantity < threshold;
    });
  }, [inventory, locationId, threshold]);

  // Группировка по точкам
  const itemsByLocation = useMemo(() => {
    const result = new Map<string, typeof lowStockItems>();
    
    lowStockItems.forEach(item => {
      const locationItems = result.get(item.locationId) || [];
      result.set(item.locationId, [...locationItems, item]);
    });
    
    return result;
  }, [lowStockItems]);

  if (lowStockItems.length === 0) {
    return null;
  }

  return (
    <Card className="border-l-4 border-l-amber-500">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <CardTitle className="text-lg">Товары с низким остатком</CardTitle>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/inventory")}
          >
            Управление инвентарем
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-[300px] overflow-auto pr-2">
          {Array.from(itemsByLocation.entries()).map(([locId, items]) => {
            const location = locations.find(loc => loc.id === locId);
            return (
              <div key={locId} className="space-y-2">
                <div className="font-medium flex items-center gap-2">
                  <Badge className="bg-brand-gold text-brand-DEFAULT">
                    {location?.name || "Неизвестная точка"}
                  </Badge>
                </div>
                <div className="pl-2 space-y-3">
                  {items.map(item => (
                    <div key={item.id} className="flex items-start justify-between border-b pb-2">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <Badge variant="outline" className="mt-1">
                          {item.size === "car" ? "Автофлакон" : `${item.size} мл`}
                        </Badge>
                      </div>
                      <div>
                        <Badge 
                          variant={item.quantity === 0 ? "destructive" : "secondary"}
                          className={item.quantity === 0 ? "bg-red-500" : "bg-amber-500 text-white"}
                        >
                          {item.quantity === 0 ? (
                            <span className="flex items-center gap-1">
                              <XCircle className="h-3 w-3" /> Отсутствует
                            </span>
                          ) : (
                            `Остаток: ${item.quantity} шт.`
                          )}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
