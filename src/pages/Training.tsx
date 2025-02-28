
import { motion } from "framer-motion";
import { GraduationCap, BookOpen, Video, FileText, CheckCircle, Clock, PlusCircle, Download } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";

const Training = () => {
  const { toast } = useToast();

  const trainingModules = [
    {
      id: "1",
      title: "Основы парфюмерии",
      description: "Введение в мир ароматов и базовые знания о парфюмерии",
      type: "Базовый",
      completed: true,
      materials: [
        { id: "1-1", title: "История парфюмерии", type: "text", duration: "25 мин" },
        { id: "1-2", title: "Классификация ароматов", type: "video", duration: "18 мин" },
        { id: "1-3", title: "Пирамида нот", type: "text", duration: "15 мин" },
        { id: "1-4", title: "Практическое занятие: определение нот", type: "quiz", duration: "30 мин" }
      ]
    },
    {
      id: "2",
      title: "Техники продаж",
      description: "Методы эффективных продаж парфюмерии и работы с клиентами",
      type: "Продвинутый",
      completed: false,
      progress: 65,
      materials: [
        { id: "2-1", title: "Выявление потребностей клиента", type: "video", duration: "22 мин", completed: true },
        { id: "2-2", title: "Презентация аромата", type: "text", duration: "15 мин", completed: true },
        { id: "2-3", title: "Работа с возражениями", type: "video", duration: "28 мин", completed: false },
        { id: "2-4", title: "Завершение продажи", type: "text", duration: "12 мин", completed: false },
        { id: "2-5", title: "Практические сценарии", type: "quiz", duration: "40 мин", completed: false }
      ]
    },
    {
      id: "3",
      title: "Ассортимент âme",
      description: "Детальная информация о всех ароматах бренда âme",
      type: "Продуктовый",
      completed: false,
      progress: 30,
      materials: [
        { id: "3-1", title: "Философия бренда âme", type: "video", duration: "15 мин", completed: true },
        { id: "3-2", title: "Коллекция 'Элегантность'", type: "text", duration: "20 мин", completed: true },
        { id: "3-3", title: "Коллекция 'Свежесть'", type: "text", duration: "20 мин", completed: false },
        { id: "3-4", title: "Коллекция 'Чувственность'", type: "text", duration: "20 мин", completed: false },
        { id: "3-5", title: "Тест на знание ассортимента", type: "quiz", duration: "30 мин", completed: false }
      ]
    }
  ];

  const getMaterialIcon = (type: string) => {
    switch (type) {
      case "text":
        return <FileText className="h-4 w-4" />;
      case "video":
        return <Video className="h-4 w-4" />;
      case "quiz":
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <BookOpen className="h-4 w-4" />;
    }
  };

  const getModuleProgress = (module: any) => {
    if (module.completed) return 100;
    if (module.progress) return module.progress;
    
    if (module.materials) {
      const completedCount = module.materials.filter((m: any) => m.completed).length;
      return Math.round((completedCount / module.materials.length) * 100);
    }
    
    return 0;
  };

  return (
    <div className="container mx-auto py-10 px-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-4xl font-serif mb-2 flex items-center gap-2">
              <GraduationCap className="h-8 w-8 text-brand-purple" />
              Обучение
            </h1>
            <p className="text-muted-foreground max-w-xl">
              Материалы для обучения команды продаж и информация о продукции
            </p>
          </div>
          <Button className="mt-4 md:mt-0" onClick={() => toast({ 
            title: "Новый материал", 
            description: "Функция добавления нового обучающего материала" 
          })}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Добавить материал
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Учебные модули</CardTitle>
              <CardDescription>Всего доступно</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-brand-purple">{trainingModules.length}</div>
              <p className="text-muted-foreground">учебных разделов</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Материалы</CardTitle>
              <CardDescription>Всего уроков</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-brand-purple">
                {trainingModules.reduce((acc, module) => acc + module.materials.length, 0)}
              </div>
              <p className="text-muted-foreground">отдельных уроков</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Ваш прогресс</CardTitle>
              <CardDescription>Общее завершение</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-brand-purple">
                {Math.round(trainingModules.reduce((acc, module) => acc + getModuleProgress(module), 0) / trainingModules.length)}%
              </div>
              <p className="text-muted-foreground">пройдено материалов</p>
            </CardContent>
          </Card>
        </div>

        <h2 className="text-xl font-medium mb-4">Учебные модули</h2>
        
        <div className="grid grid-cols-1 gap-6">
          {trainingModules.map((module) => (
            <Card key={module.id} className="overflow-hidden">
              <CardHeader className="bg-brand-purple/5 pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{module.title}</CardTitle>
                    <CardDescription className="mt-1">
                      {module.description}
                    </CardDescription>
                  </div>
                  <Badge className={
                    module.type === "Базовый" 
                      ? "bg-blue-500" 
                      : module.type === "Продвинутый" 
                        ? "bg-brand-purple" 
                        : "bg-orange-500"
                  }>
                    {module.type}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="mb-6">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Прогресс</span>
                    <span className="text-sm text-muted-foreground">{getModuleProgress(module)}%</span>
                  </div>
                  <Progress value={getModuleProgress(module)} className="h-2" />
                </div>
                
                <h3 className="text-sm font-medium mb-3">Материалы модуля:</h3>
                <div className="space-y-3">
                  {module.materials.map((material: any) => (
                    <div 
                      key={material.id} 
                      className={`flex items-center justify-between p-3 rounded-lg border ${
                        material.completed ? "border-brand-purple/20 bg-brand-purple/5" : "border-gray-200"
                      }`}
                    >
                      <div className="flex items-center">
                        <div className={`p-1.5 rounded-full mr-3 ${
                          material.completed ? "bg-brand-purple/20" : "bg-gray-100"
                        }`}>
                          {getMaterialIcon(material.type)}
                        </div>
                        <div>
                          <p className={`font-medium ${material.completed ? "text-brand-purple" : ""}`}>
                            {material.title}
                          </p>
                          <div className="flex items-center text-xs text-muted-foreground mt-1">
                            <Clock className="h-3 w-3 mr-1" />
                            {material.duration}
                          </div>
                        </div>
                      </div>
                      <Button 
                        variant={material.completed ? "outline" : "default"}
                        size="sm"
                        className={material.completed ? "border-brand-purple/30 text-brand-purple" : "bg-brand-purple hover:bg-brand-dark-purple"}
                        onClick={() => toast({ 
                          title: material.completed ? "Материал пройден" : "Начать обучение", 
                          description: `${material.completed ? "Вы уже прошли" : "Открыт материал"}: ${material.title}` 
                        })}
                      >
                        {material.completed ? "Пройдено" : "Начать"}
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="justify-end border-t pt-4">
                <Button variant="outline" size="sm" className="mr-2" onClick={() => toast({ 
                  title: "Сертификат", 
                  description: `Выписан сертификат о прохождении модуля "${module.title}"` 
                })}>
                  <Download className="h-4 w-4 mr-1" />
                  Сертификат
                </Button>
                <Button size="sm" className="bg-brand-purple hover:bg-brand-dark-purple" onClick={() => toast({ 
                  title: "Модуль открыт", 
                  description: `Начато прохождение модуля "${module.title}"` 
                })}>
                  Продолжить обучение
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default Training;
