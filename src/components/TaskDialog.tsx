
import React, { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { format, parse } from "date-fns";
import { ru } from "date-fns/locale";
import { Task, useTasks } from "@/contexts/TaskContext";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue
} from "@/components/ui/select";
import { 
  Truck, ClipboardList, Megaphone, Calendar as CalendarIcon, 
  Check, AlertCircle, Package, Bell, FileText 
} from "lucide-react";

interface TaskDialogProps {
  isOpen: boolean;
  onClose: () => void;
  taskToEdit?: Task | null;
}

const ICONS = [
  { name: "Truck", component: <Truck className="h-4 w-4" /> },
  { name: "ClipboardList", component: <ClipboardList className="h-4 w-4" /> },
  { name: "Megaphone", component: <Megaphone className="h-4 w-4" /> },
  { name: "Calendar", component: <CalendarIcon className="h-4 w-4" /> },
  { name: "Check", component: <Check className="h-4 w-4" /> },
  { name: "AlertCircle", component: <AlertCircle className="h-4 w-4" /> },
  { name: "Package", component: <Package className="h-4 w-4" /> },
  { name: "Bell", component: <Bell className="h-4 w-4" /> },
  { name: "FileText", component: <FileText className="h-4 w-4" /> },
];

// Helper function to get icon component by name
export const getIconByName = (name: string) => {
  const icon = ICONS.find(icon => icon.name === name);
  return icon ? icon.component : <CalendarIcon className="h-4 w-4" />;
};

const TaskDialog: React.FC<TaskDialogProps> = ({ isOpen, onClose, taskToEdit }) => {
  const { addTask, updateTask } = useTasks();
  const [title, setTitle] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedIcon, setSelectedIcon] = useState("Calendar");
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      try {
        // Parse the date string to a Date object
        const parsedDate = parse(taskToEdit.date, "d MMMM yyyy", new Date(), { locale: ru });
        setSelectedDate(parsedDate);
      } catch (error) {
        console.error("Failed to parse date:", error);
        setSelectedDate(new Date());
      }
      setSelectedIcon(taskToEdit.icon);
    } else {
      // Reset form for new task
      setTitle("");
      setSelectedDate(new Date());
      setSelectedIcon("Calendar");
    }
  }, [taskToEdit, isOpen]);

  const handleSubmit = () => {
    if (!title.trim() || !selectedDate) return;

    const formattedDate = format(selectedDate, "d MMMM yyyy", { locale: ru });
    
    if (taskToEdit) {
      updateTask({
        ...taskToEdit,
        title,
        date: formattedDate,
        icon: selectedIcon
      });
    } else {
      addTask({
        title,
        date: formattedDate,
        icon: selectedIcon,
        completed: false
      });
    }
    
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{taskToEdit ? "Редактировать задачу" : "Новая задача"}</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="task-title" className="text-right">
              Название
            </Label>
            <Input
              id="task-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="col-span-3"
              placeholder="Введите название задачи"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Дата</Label>
            <div className="col-span-3 relative">
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
                onClick={() => setIsCalendarOpen(!isCalendarOpen)}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? format(selectedDate, "d MMMM yyyy", { locale: ru }) : "Выберите дату"}
              </Button>
              {isCalendarOpen && (
                <div className="absolute z-10 mt-1 bg-white rounded-md shadow-lg">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => {
                      setSelectedDate(date);
                      setIsCalendarOpen(false);
                    }}
                    locale={ru}
                  />
                </div>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Иконка</Label>
            <Select value={selectedIcon} onValueChange={setSelectedIcon}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Выберите иконку" />
              </SelectTrigger>
              <SelectContent>
                {ICONS.map((icon) => (
                  <SelectItem key={icon.name} value={icon.name}>
                    <div className="flex items-center">
                      <div className="mr-2">{icon.component}</div>
                      <span>{icon.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Отмена</Button>
          </DialogClose>
          <Button onClick={handleSubmit}>
            {taskToEdit ? "Сохранить" : "Добавить"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TaskDialog;
