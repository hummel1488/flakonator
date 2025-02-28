
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useInventory } from "@/hooks/use-inventory";

interface InventoryStatsProps {
  inventory: any[];
  filterLocation: string;
  locations: any[];
}

export const InventoryStats = ({ inventory, filterLocation, locations }: InventoryStatsProps) => {
  const { getSizeStatKey } = useInventory();

  const getLocationName = (id: string) => {
    const location = locations.find(loc => loc.id === id);
    return location ? location.name : "Неизвестно";
  };

  const getSizeLabel = (size: string) => {
    if (size === "Автофлакон" || size === "car") return "Автофлакон";
    return size.includes("мл") ? size : `${size} мл`;
  };

  const calculateInventoryStats = () => {
    const inventoryToCalculate = filterLocation === "all" 
      ? inventory 
      : inventory.filter(item => item.locationId === filterLocation);

    const sizeStats: Record<string, { count: number, value: number }> = {
      "5": { count: 0, value: 0 },
      "16": { count: 0, value: 0 },
      "20": { count: 0, value: 0 },
      "25": { count: 0, value: 0 },
      "30": { count: 0, value: 0 },
      "car": { count: 0, value: 0 },
    };

    const prices: Record<string, number> = {
      "5": 500,
      "16": 1000,
      "20": 1300,
      "25": 1500,
      "30": 1800,
      "car": 500
    };

    inventoryToCalculate.forEach(item => {
      const statKey = getSizeStatKey(item.size);
      
      if (sizeStats[statKey]) {
        sizeStats[statKey].count += item.quantity;
        const itemPrice = item.price || prices[statKey];
        sizeStats[statKey].value += item.quantity * itemPrice;
      } else {
        console.log(`Неизвестный размер: ${item.size} (ключ: ${statKey}) для товара: ${item.name}`);
      }
    });

    const totalCount = Object.values(sizeStats).reduce((sum, stat) => sum + stat.count, 0);
    const totalValue = Object.values(sizeStats).reduce((sum, stat) => sum + stat.value, 0);

    return { sizeStats, totalCount, totalValue };
  };
  
  const stats = calculateInventoryStats();

  return (
    <Card className="shadow-md border border-gray-100 bg-white">
      <CardHeader>
        <CardTitle>Статистика инвентаря {filterLocation !== "all" && `- ${getLocationName(filterLocation)}`}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="shadow-sm">
            <CardContent className="p-4">
              <div className="text-sm text-gray-500 mb-1">Общее количество</div>
              <div className="text-2xl font-bold">{stats.totalCount} шт.</div>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardContent className="p-4">
              <div className="text-sm text-gray-500 mb-1">Общая стоимость</div>
              <div className="text-2xl font-bold">{stats.totalValue.toLocaleString()} ₽</div>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardContent className="p-4">
              <div className="text-sm text-gray-500 mb-1">Количество наименований</div>
              <div className="text-2xl font-bold">{inventory.length} шт.</div>
            </CardContent>
          </Card>
        </div>

        <Separator className="my-6" />

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Object.entries(stats.sizeStats).map(([size, { count, value }]) => (
            <Card key={size} className="shadow-sm">
              <CardContent className="p-4">
                <div className="flex justify-between items-center mb-2">
                  <div className="text-sm font-medium">{getSizeLabel(size)}</div>
                  <Badge variant="outline">{count} шт.</Badge>
                </div>
                <div className="text-right text-amber-600 font-semibold">
                  {value.toLocaleString()} ₽
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
