
import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardTitle, CardHeader, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ImportLogItem } from "@/hooks/use-inventory";
import { AlertTriangle, CheckCircle, XCircle } from "lucide-react";

interface ImportDialogProps {
  showDialog: boolean;
  setShowDialog: (value: boolean) => void;
  locations: any[];
  importFromCSV: (data: string, locationId: string, zeroNonExisting: boolean) => any;
  toast: any;
}

export const ImportDialog = ({ 
  showDialog, 
  setShowDialog, 
  locations, 
  importFromCSV, 
  toast 
}: ImportDialogProps) => {
  const [importData, setImportData] = useState<string>("");
  const [manualLocationId, setManualLocationId] = useState<string>("");
  const [importResultLogs, setImportResultLogs] = useState<ImportLogItem[]>([]);
  const [importStats, setImportStats] = useState<any>(null);
  const [importTab, setImportTab] = useState<string>("upload");
  const [zeroNonExisting, setZeroNonExisting] = useState<boolean>(true);
  const [showImportResults, setShowImportResults] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getLocationName = (id: string) => {
    const location = locations.find(loc => loc.id === id);
    return location ? location.name : "Неизвестно";
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setImportData(content);
      setImportTab("preview");
      
      setImportResultLogs([]);
      setImportStats(null);
      setShowImportResults(false);
    };
    reader.readAsText(file);
  };

  const handleImportData = () => {
    try {
      if (!importData) {
        toast({
          title: "Ошибка",
          description: "Нет данных для импорта",
          variant: "destructive",
        });
        return;
      }
      
      if (!manualLocationId) {
        toast({
          title: "Ошибка",
          description: "Выберите точку продажи для импорта",
          variant: "destructive",
        });
        return;
      }
        
      console.log(`Importing data for location ${manualLocationId}, zero non-existing: ${zeroNonExisting}`);
      
      const result = importFromCSV(importData, manualLocationId, zeroNonExisting);
      
      setImportResultLogs(result.logs);
      setImportStats({
        importedCount: result.importedCount,
        skippedCount: result.skippedCount,
        newItemsCount: result.newItemsCount,
        updatedItemsCount: result.updatedItemsCount,
        zeroedItemsCount: result.zeroedItemsCount
      });
      
      setImportTab("results");
      setShowImportResults(true);
      
      toast({
        title: "Импорт завершен",
        description: `Успешно импортировано ${result.importedCount} товаров`,
      });
      
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Error during import:", error);
      toast({
        title: "Ошибка импорта",
        description: error instanceof Error ? error.message : "Произошла ошибка при импорте данных",
        variant: "destructive",
      });
    }
  };

  const closeImportDialog = () => {
    setShowDialog(false);
    setImportData("");
    setManualLocationId("");
    setImportResultLogs([]);
    setImportStats(null);
    setShowImportResults(false);
    setImportTab("upload");
    
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const getLogTypeIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };
  
  return (
    <Dialog open={showDialog} onOpenChange={closeImportDialog}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Импорт товаров</DialogTitle>
          <DialogDescription>
            Загрузите файл CSV для импорта товаров
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={importTab} onValueChange={setImportTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="upload">Загрузка файла</TabsTrigger>
            <TabsTrigger value="preview" disabled={!importData}>Предпросмотр</TabsTrigger>
            <TabsTrigger value="results" disabled={!showImportResults}>Результаты</TabsTrigger>
          </TabsList>
          
          <TabsContent value="upload" className="pt-4">
            <div className="grid gap-6">
              <div className="grid grid-cols-1 gap-2">
                <Label htmlFor="file-upload">Выберите CSV-файл</Label>
                <Input 
                  id="file-upload" 
                  type="file" 
                  accept=".csv,.txt" 
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Поддерживаемые форматы: CSV, TXT с разделителями (запятая, точка с запятой или табуляция)
                </p>
              </div>
              
              <div className="grid grid-cols-1 gap-2">
                <Label htmlFor="import-location">Точка продажи</Label>
                <Select 
                  value={manualLocationId} 
                  onValueChange={(value) => setManualLocationId(value)}
                >
                  <SelectTrigger id="import-location">
                    <SelectValue placeholder="Выберите точку продажи" />
                  </SelectTrigger>
                  <SelectContent className="z-[9999] bg-white">
                    {locations.map((location) => (
                      <SelectItem key={location.id} value={location.id}>
                        {location.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="zero-existing" 
                  checked={zeroNonExisting}
                  onCheckedChange={(checked) => setZeroNonExisting(checked as boolean)}
                />
                <Label htmlFor="zero-existing">
                  Обнулить остатки товаров, отсутствующих в файле импорта
                </Label>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Требования к формату</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li>Первая строка должна содержать заголовки колонок</li>
                    <li>Обязательные колонки: <strong>Название</strong> и <strong>Остаток</strong></li>
                    <li>Колонка <strong>Объем</strong> опциональна (по умолчанию "5 мл")</li>
                    <li>Поддерживаемые объемы: 5 мл, 16 мл, 20 мл, 25 мл, 30 мл, Автофлакон</li>
                    <li>Остаток должен быть числом больше нуля</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="preview" className="pt-4">
            <div className="grid gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Предпросмотр импорта</CardTitle>
                  <CardDescription>
                    Проверьте правильность данных перед импортом
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <pre className="text-xs bg-gray-50 p-4 rounded-md overflow-auto max-h-[200px]">
                    {importData.slice(0, 500)}
                    {importData.length > 500 && '...'}
                  </pre>
                </CardContent>
                <CardFooter>
                  <p className="text-sm text-gray-500">
                    Файл будет импортирован в локацию: <strong>{
                      getLocationName(manualLocationId)
                    }</strong>
                  </p>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="results" className="pt-4">
            {importStats && (
              <div className="grid gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Результаты импорта</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      <div className="bg-green-50 p-3 rounded-md">
                        <div className="text-sm text-green-700">Импортировано</div>
                        <div className="text-xl font-bold">{importStats.importedCount}</div>
                      </div>
                      <div className="bg-amber-50 p-3 rounded-md">
                        <div className="text-sm text-amber-700">Пропущено</div>
                        <div className="text-xl font-bold">{importStats.skippedCount}</div>
                      </div>
                      <div className="bg-blue-50 p-3 rounded-md">
                        <div className="text-sm text-blue-700">Новых</div>
                        <div className="text-xl font-bold">{importStats.newItemsCount}</div>
                      </div>
                      <div className="bg-indigo-50 p-3 rounded-md">
                        <div className="text-sm text-indigo-700">Обновлено</div>
                        <div className="text-xl font-bold">{importStats.updatedItemsCount}</div>
                      </div>
                      <div className="bg-red-50 p-3 rounded-md">
                        <div className="text-sm text-red-700">Обнулено</div>
                        <div className="text-xl font-bold">{importStats.zeroedItemsCount}</div>
                      </div>
                    </div>
                    
                    <div className="mt-6">
                      <h4 className="font-medium mb-2">Журнал импорта:</h4>
                      <div className="border rounded-md max-h-[300px] overflow-auto">
                        <table className="min-w-full">
                          <thead className="bg-gray-50 sticky top-0">
                            <tr>
                              <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Тип</th>
                              <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Сообщение</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {importResultLogs.map((log, index) => (
                              <tr key={index} className={log.type === 'error' ? 'bg-red-50' : ''}>
                                <td className="py-2 px-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    {getLogTypeIcon(log.type)}
                                    <span className="ml-2 text-xs capitalize">{log.type}</span>
                                  </div>
                                </td>
                                <td className="py-2 px-4 text-sm">{log.message}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="sticky bottom-0 bg-white pt-6 pb-4 z-10 border-t mt-8">
          <Button variant="outline" onClick={closeImportDialog}>
            Закрыть
          </Button>
          <Button onClick={handleImportData} disabled={!importData || !manualLocationId}>
            Импортировать
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
