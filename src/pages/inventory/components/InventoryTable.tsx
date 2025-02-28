
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";

interface InventoryTableProps {
  loading: boolean;
  filteredInventory: any[];
  searchTerm: string;
  filterLocation: string;
  filterSize: string;
  locations: any[];
  isAdmin: () => boolean;
  isManager: () => boolean;
  openUpdateDialog: (product: any) => void;
}

export const InventoryTable = ({ 
  loading, 
  filteredInventory, 
  searchTerm, 
  filterLocation, 
  filterSize,
  locations, 
  isAdmin, 
  isManager,
  openUpdateDialog 
}: InventoryTableProps) => {
  const getLocationName = (id: string) => {
    const location = locations.find(loc => loc.id === id);
    return location ? location.name : "Неизвестно";
  };
  
  const getSizeLabel = (size: string) => {
    if (size === "Автофлакон" || size === "car") return "Автофлакон";
    return size.includes("мл") ? size : `${size} мл`;
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[300px]">Название</TableHead>
            <TableHead>Объем</TableHead>
            <TableHead>Тип</TableHead>
            <TableHead>Точка продажи</TableHead>
            <TableHead className="text-right">Количество</TableHead>
            {(isAdmin() || isManager()) && (
              <TableHead className="text-right">Действия</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-10 text-gray-500">
                Загрузка...
              </TableCell>
            </TableRow>
          ) : filteredInventory.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-10 text-gray-500">
                {searchTerm || filterLocation !== "all" || filterSize !== "all"
                  ? "Нет товаров, соответствующих фильтрам"
                  : "Нет товаров в инвентаре. Добавьте товар, нажав кнопку выше."}
              </TableCell>
            </TableRow>
          ) : (
            filteredInventory.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>{getSizeLabel(item.size)}</TableCell>
                <TableCell>
                  {item.type === "perfume" ? "Парфюм" : "Другое"}
                </TableCell>
                <TableCell>{getLocationName(item.locationId)}</TableCell>
                <TableCell className="text-right">
                  <Badge className={`font-medium ${item.quantity > 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                    {item.quantity}
                  </Badge>
                </TableCell>
                {(isAdmin() || isManager()) && (
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openUpdateDialog(item)}
                    >
                      Изменить
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
