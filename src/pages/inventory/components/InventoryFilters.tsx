
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface InventoryFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  filterLocation: string;
  setFilterLocation: (value: string) => void;
  filterSize: string;
  setFilterSize: (value: string) => void;
  locations: any[];
}

export const InventoryFilters = ({
  searchTerm,
  setSearchTerm,
  filterLocation,
  setFilterLocation,
  filterSize,
  setFilterSize,
  locations
}: InventoryFiltersProps) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 items-end">
      <div className="flex-1">
        <Label htmlFor="search">Поиск</Label>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            id="search"
            type="text"
            placeholder="Поиск по названию..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      <div className="w-full md:w-64">
        <Label htmlFor="location-filter">Точка продажи</Label>
        <Select
          value={filterLocation}
          onValueChange={(value) => setFilterLocation(value)}
        >
          <SelectTrigger id="location-filter" className="w-full">
            <SelectValue placeholder="Все точки" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все точки</SelectItem>
            {locations.map((location) => (
              <SelectItem key={location.id} value={location.id}>
                {location.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="w-full md:w-48">
        <Label htmlFor="size-filter">Объем</Label>
        <Select
          value={filterSize}
          onValueChange={(value) => setFilterSize(value)}
        >
          <SelectTrigger id="size-filter" className="w-full">
            <SelectValue placeholder="Все размеры" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все размеры</SelectItem>
            <SelectItem value="5">5 мл</SelectItem>
            <SelectItem value="16">16 мл</SelectItem>
            <SelectItem value="20">20 мл</SelectItem>
            <SelectItem value="25">25 мл</SelectItem>
            <SelectItem value="30">30 мл</SelectItem>
            <SelectItem value="car">Автофлакон</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
