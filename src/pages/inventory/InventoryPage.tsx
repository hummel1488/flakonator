
import { useState } from "react";
import { motion } from "framer-motion";
import { PlusCircle, ArrowLeft, Database, Upload, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useInventory } from "@/hooks/use-inventory";
import { useLocations } from "@/hooks/use-locations";
import { useAuth } from "@/contexts/AuthContext";
import Navigation from "@/components/Navigation";
import { InventoryStats } from "./components/InventoryStats";
import { InventoryFilters } from "./components/InventoryFilters";
import { InventoryTable } from "./components/InventoryTable";
import { AddProductDialog } from "./components/AddProductDialog";
import { UpdateProductDialog } from "./components/UpdateProductDialog";
import { DeleteAllDialog } from "./components/DeleteAllDialog";
import { ImportDialog } from "./components/ImportDialog";

export const InventoryPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { inventory, addProduct, loading, updateProductQuantity, deleteAllProducts, importFromCSV } = useInventory();
  const { locations } = useLocations();
  const { isAdmin, isManager } = useAuth();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLocation, setFilterLocation] = useState("all");
  const [filterSize, setFilterSize] = useState("all");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showDeleteAllDialog, setShowDeleteAllDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [showStats, setShowStats] = useState(true);

  const handleAddProduct = (formData: any) => {
    if (!formData.name.trim() || !formData.location) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, заполните все обязательные поля",
        variant: "destructive",
      });
      return;
    }

    addProduct({
      id: Date.now().toString(),
      name: formData.name,
      size: formData.size,
      type: formData.type,
      locationId: formData.location,
      quantity: formData.quantity,
    });

    toast({
      title: "Продукт добавлен",
      description: "Новый продукт успешно добавлен в инвентарь",
    });

    setShowAddDialog(false);
  };

  const handleUpdateProduct = (productId: string, newQuantity: number) => {
    updateProductQuantity(productId, newQuantity);

    toast({
      title: "Остаток обновлен",
      description: "Количество товара успешно обновлено",
    });

    setShowUpdateDialog(false);
    setSelectedProduct(null);
  };

  const handleDeleteAllProducts = () => {
    deleteAllProducts();
    
    toast({
      title: "Инвентарь очищен",
      description: "Все ароматы успешно удалены из инвентаря",
    });
    
    setShowDeleteAllDialog(false);
  };

  const openUpdateDialog = (product: any) => {
    setSelectedProduct(product);
    setShowUpdateDialog(true);
  };

  const filteredInventory = inventory.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation = filterLocation === "all" || item.locationId === filterLocation;
    const matchesSize = filterSize === "all" || item.size === filterSize;
    return matchesSearch && matchesLocation && matchesSize;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Navigation />
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-8"
          >
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/")}
                className="rounded-full"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-2xl font-medium">Инвентарь</h1>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setShowStats(!showStats)}
                variant="outline"
                className="gap-2"
              >
                <Database className="h-4 w-4" />
                {showStats ? "Скрыть статистику" : "Показать статистику"}
              </Button>
              {isAdmin() && (
                <Button
                  onClick={() => setShowDeleteAllDialog(true)}
                  variant="destructive"
                  className="gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Удалить все
                </Button>
              )}
              {(isAdmin() || isManager()) && (
                <>
                  <Button
                    onClick={() => setShowImportDialog(true)}
                    variant="outline"
                    className="gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    Импорт
                  </Button>
                  <Button
                    onClick={() => setShowAddDialog(true)}
                    variant={isAdmin() ? "admin" : "manager"}
                    className="gap-2"
                  >
                    <PlusCircle className="h-4 w-4" />
                    Добавить товар
                  </Button>
                </>
              )}
            </div>
          </motion.div>

          {showStats && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <InventoryStats inventory={inventory} filterLocation={filterLocation} locations={locations} />
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg shadow-md border border-gray-100 p-6 mb-6"
          >
            <InventoryFilters 
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              filterLocation={filterLocation}
              setFilterLocation={setFilterLocation}
              filterSize={filterSize}
              setFilterSize={setFilterSize}
              locations={locations}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden"
          >
            <InventoryTable 
              loading={loading}
              filteredInventory={filteredInventory}
              searchTerm={searchTerm}
              filterLocation={filterLocation}
              filterSize={filterSize}
              locations={locations}
              isAdmin={isAdmin}
              isManager={isManager}
              openUpdateDialog={openUpdateDialog}
            />
          </motion.div>
        </div>
      </div>

      {showAddDialog && (
        <AddProductDialog 
          showDialog={showAddDialog}
          setShowDialog={setShowAddDialog}
          locations={locations}
          onAddProduct={handleAddProduct}
        />
      )}

      {showUpdateDialog && selectedProduct && (
        <UpdateProductDialog 
          showDialog={showUpdateDialog}
          setShowDialog={setShowUpdateDialog}
          product={selectedProduct}
          onUpdateProduct={handleUpdateProduct}
        />
      )}

      {showDeleteAllDialog && (
        <DeleteAllDialog 
          showDialog={showDeleteAllDialog}
          setShowDialog={setShowDeleteAllDialog}
          onConfirmDelete={handleDeleteAllProducts}
        />
      )}

      {showImportDialog && (
        <ImportDialog 
          showDialog={showImportDialog}
          setShowDialog={setShowImportDialog}
          locations={locations}
          importFromCSV={importFromCSV}
          toast={toast}
        />
      )}
    </div>
  );
};
