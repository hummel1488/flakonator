
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, Check, X } from "lucide-react";
import { Task, useTasks } from "@/contexts/TaskContext";
import TaskDialog, { getIconByName } from "./TaskDialog";
import { motion } from "framer-motion";

const TaskCalendar: React.FC = () => {
  const { tasks, toggleTaskCompletion, deleteTask } = useTasks();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const handleAddTask = () => {
    setEditingTask(null);
    setIsDialogOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingTask(null);
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    // Sort by completion status first (uncompleted first)
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    // Then sort by date (assuming date strings can be compared lexicographically for Russian dates)
    return a.date.localeCompare(b.date);
  });

  return (
    <>
      <Card className="overflow-hidden">
        <CardHeader className="pb-2 flex flex-row justify-between items-center">
          <CardTitle className="text-xl flex items-center">
            Календарь задач
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8 w-8 p-0" 
            onClick={handleAddTask}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-3">
            {sortedTasks.length === 0 ? (
              <div className="text-center text-muted-foreground py-4">
                Нет задач. Нажмите + чтобы добавить.
              </div>
            ) : (
              sortedTasks.map((task) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex items-start space-x-3 border-b last:border-0 pb-3 last:pb-0 ${
                    task.completed ? "opacity-60" : ""
                  }`}
                >
                  <div className={`bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300 p-2 rounded-full ${
                    task.completed ? "bg-opacity-60" : ""
                  }`}>
                    {getIconByName(task.icon)}
                  </div>
                  <div className="flex-grow">
                    <p className={`font-medium ${task.completed ? "line-through" : ""}`}>{task.title}</p>
                    <p className="text-sm text-muted-foreground">{task.date}</p>
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => toggleTaskCompletion(task.id)}
                      title={task.completed ? "Отметить как невыполненное" : "Отметить как выполненное"}
                    >
                      {task.completed ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => handleEditTask(task)}
                      title="Редактировать"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive/90"
                      onClick={() => deleteTask(task.id)}
                      title="Удалить"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <TaskDialog 
        isOpen={isDialogOpen} 
        onClose={handleDialogClose} 
        taskToEdit={editingTask} 
      />
    </>
  );
};

export default TaskCalendar;
