
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Download, Upload, Save, FileText, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useInventory } from "@/hooks/use-inventory";
import { useLocations } from "@/hooks/use-locations";
import { useSales } from "@/hooks/use-sales";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Navigation from "@/components/Navigation";

const DataManagement = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { exportInventory, importInventory } = useInventory();
  const { exportLocations, importLocations } = useLocations();
  const { exportSales, importSales } = useSales();
  
  const [activeTab, setActiveTab] = useState("export");
  const [inventoryData, setInventoryData] = useState("");
  const [locationsData, setLocationsData] = useState("");
  const [salesData, setSalesData] = useState("");
  const [importType, setImportType] = useState<"inventory" | "locations" | "sales" | "all">("all");
  const [importData, setImportData] = useState("");

  const handleExportAll = () => {
    try {
      const data = {
        inventory: JSON.parse(exportInventory()),
        locations: JSON.parse(exportLocations()),
        sales: JSON.parse(exportSales()),
        exportDate: new Date().toISOString(),
        version: "1.0"
      };
      
      // Create a downloadable file
      const dataStr = JSON.stringify(data, null, 2);
      const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
      
      const exportFileDefaultName = `scenttrack-export-${new Date().toISOString().split('T')[0]}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      toast({
        title: "Данные экспортированы",
        description: "Все данные успешно экспортированы в файл",
      });
    } catch (error) {
      console.error("Ошибка при экспорте данных:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось экспортировать данные",
        variant: "destructive",
      });
    }
  };

  const handleExportIndividual = (type: string) => {
    try {
      let data: string;
      let filename: string;
      
      switch (type) {
        case "inventory":
          data = exportInventory();
          filename = `scenttrack-inventory-${new Date().toISOString().split('T')[0]}.json`;
          setInventoryData(data);
          break;
        case "locations":
          data = exportLocations();
          filename = `scenttrack-locations-${new Date().toISOString().split('T')[0]}.json`;
          setLocationsData(data);
          break;
        case "sales":
          data = exportSales();
          filename = `scenttrack-sales-${new Date().toISOString().split('T')[0]}.json`;
          setSalesData(data);
          break;
        default:
          return;
      }
      
      // Create a downloadable file
      const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(data)}`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', filename);
      linkElement.click();
      
      toast({
        title: "Данные экспортированы",
        description: `Данные ${type === "inventory" ? "инвентаря" : type === "locations" ? "точек продаж" : "продаж"} успешно экспортированы`,
      });
    } catch (error) {
      console.error(`Ошибка при экспорте данных ${type}:`, error);
      toast({
        title: "Ошибка",
        description: "Не удалось экспортировать данные",
        variant: "destructive",
      });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setImportData(content);
    };
    reader.readAsText(file);
  };

  const handleImport = () => {
    if (!importData) {
      toast({
        title: "Ошибка",
        description: "Нет данных для импорта",
        variant: "destructive",
      });
      return;
    }

    try {
      const data = JSON.parse(importData);
      
      // Check if it's a combined export file
      if (data.version && data.inventory && data.locations && data.sales) {
        if (importType === "all" || importType === "inventory") {
          const inventoryResult = importInventory(JSON.stringify(data.inventory));
          if (inventoryResult.success) {
            toast({
              title: "Инвентарь импортирован",
              description: inventoryResult.message,
            });
          } else {
            toast({
              title: "Ошибка импорта инвентаря",
              description: inventoryResult.message,
              variant: "destructive",
            });
          }
        }
        
        if (importType === "all" || importType === "locations") {
          const locationsResult = importLocations(JSON.stringify(data.locations));
          if (locationsResult.success) {
            toast({
              title: "Точки продаж импортированы",
              description: locationsResult.message,
            });
          } else {
            toast({
              title: "Ошибка импорта точек продаж",
              description: locationsResult.message,
              variant: "destructive",
            });
          }
        }
        
        if (importType === "all" || importType === "sales") {
          const salesResult = importSales(JSON.stringify(data.sales));
          if (salesResult.success) {
            toast({
              title: "Продажи импортированы",
              description: salesResult.message,
            });
          } else {
            toast({
              title: "Ошибка импорта продаж",
              description: salesResult.message,
              variant: "destructive",
            });
          }
        }
      } else {
        // Try to import as individual data
        let result;
        
        switch (importType) {
          case "inventory":
            result = importInventory(importData);
            break;
          case "locations":
            result = importLocations(importData);
            break;
          case "sales":
            result = importSales(importData);
            break;
          default:
            // Try to guess the data type
            if (data[0] && data[0].name && (data[0].address !== undefined || data[0].contact !== undefined)) {
              result = importLocations(importData);
              setImportType("locations");
            } else if (data[0] && data[0].items && data[0].total !== undefined) {
              result = importSales(importData);
              setImportType("sales");
            } else if (data[0] && data[0].name && data[0].size && data[0].quantity !== undefined) {
              result = importInventory(importData);
              setImportType("inventory");
            } else {
              toast({
                title: "Ошибка",
                description: "Невозможно определить тип данных. Пожалуйста, выберите тип импорта.",
                variant: "destructive",
              });
              return;
            }
        }
        
        if (result && result.success) {
          toast({
            title: "Данные импортированы",
            description: result.message,
          });
        } else if (result) {
          toast({
            title: "Ошибка импорта",
            description: result.message,
            variant: "destructive",
          });
        }
      }
      
    } catch (error) {
      console.error("Ошибка при импорте данных:", error);
      toast({
        title: "Ошибка",
        description: "Неверный формат данных",
        variant: "destructive",
      });
    }
  };

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
              <h1 className="text-2xl font-medium">Управление данными</h1>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="export">Экспорт данных</TabsTrigger>
                <TabsTrigger value="import">Импорт данных</TabsTrigger>
              </TabsList>
              
              <TabsContent value="export" className="mt-6 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Экспорт всех данных</CardTitle>
                    <CardDescription>
                      Экспорт всех данных приложения в один файл для резервного копирования или переноса.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Важная информация</AlertTitle>
                      <AlertDescription>
                        При публикации приложения или его использовании на другом устройстве, все данные хранятся локально. 
                        Экспортируйте данные для их сохранения и последующего импорта.
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      onClick={handleExportAll}
                      className="flex items-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Экспортировать все данные
                    </Button>
                  </CardFooter>
                </Card>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Инвентарь</CardTitle>
                      <CardDescription>
                        Экспорт данных инвентаря
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button 
                        onClick={() => handleExportIndividual("inventory")}
                        className="w-full flex items-center gap-2"
                      >
                        <FileText className="h-4 w-4" />
                        Экспортировать
                      </Button>
                      
                      {inventoryData && (
                        <div className="mt-4">
                          <ScrollArea className="h-32 w-full rounded-md border p-2">
                            <pre className="text-xs">{inventoryData}</pre>
                          </ScrollArea>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Точки продаж</CardTitle>
                      <CardDescription>
                        Экспорт данных точек продаж
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button 
                        onClick={() => handleExportIndividual("locations")}
                        className="w-full flex items-center gap-2"
                      >
                        <FileText className="h-4 w-4" />
                        Экспортировать
                      </Button>
                      
                      {locationsData && (
                        <div className="mt-4">
                          <ScrollArea className="h-32 w-full rounded-md border p-2">
                            <pre className="text-xs">{locationsData}</pre>
                          </ScrollArea>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Продажи</CardTitle>
                      <CardDescription>
                        Экспорт данных продаж
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button 
                        onClick={() => handleExportIndividual("sales")}
                        className="w-full flex items-center gap-2"
                      >
                        <FileText className="h-4 w-4" />
                        Экспортировать
                      </Button>
                      
                      {salesData && (
                        <div className="mt-4">
                          <ScrollArea className="h-32 w-full rounded-md border p-2">
                            <pre className="text-xs">{salesData}</pre>
                          </ScrollArea>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="import" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Импорт данных</CardTitle>
                    <CardDescription>
                      Импорт данных из ранее созданного экспорта
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-2">Выберите файл</h3>
                      <input
                        type="file"
                        accept=".json"
                        onChange={handleFileUpload}
                        className="w-full"
                      />
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="text-lg font-medium mb-2">Тип импорта</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Button
                          variant={importType === "all" ? "default" : "outline"}
                          onClick={() => setImportType("all")}
                        >
                          Все данные
                        </Button>
                        <Button
                          variant={importType === "inventory" ? "default" : "outline"}
                          onClick={() => setImportType("inventory")}
                        >
                          Инвентарь
                        </Button>
                        <Button
                          variant={importType === "locations" ? "default" : "outline"}
                          onClick={() => setImportType("locations")}
                        >
                          Точки продаж
                        </Button>
                        <Button
                          variant={importType === "sales" ? "default" : "outline"}
                          onClick={() => setImportType("sales")}
                        >
                          Продажи
                        </Button>
                      </div>
                    </div>
                    
                    {importData && (
                      <div>
                        <h3 className="text-lg font-medium mb-2">Данные для импорта</h3>
                        <ScrollArea className="h-64 w-full rounded-md border p-2">
                          <pre className="text-xs">{importData}</pre>
                        </ScrollArea>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Button 
                      onClick={handleImport}
                      disabled={!importData}
                      className="flex items-center gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      Импортировать данные
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default DataManagement;
