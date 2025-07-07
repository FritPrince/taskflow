'use client';

import { useState, useEffect } from 'react';
import { DndContext, DragEndEvent, DragOverEvent, DragStartEvent, DragOverlay } from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { KanbanColumn } from './kanban-column';
import { KanbanCard } from './kanban-card';
import { CreateTaskDialog } from './create-task-dialog';
import { TaskDetailsDialog } from './task-details-dialog';
import { TaskFilters } from './task-filters';
import { supabase, type Project, type Task, type TaskStatus } from '@/lib/supabase';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Calendar, Filter, BarChart3, Users, Clock, Target, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

interface KanbanBoardProps {
  project: Project;
}

interface TaskFilters {
  priority: string[];
  assignee: string[];
  dueDate: string;
  search: string;
}

export function KanbanBoard({ project }: KanbanBoardProps) {
  const { user } = useAuth();
  const [statuses, setStatuses] = useState<TaskStatus[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<TaskFilters>({
    priority: [],
    assignee: [],
    dueDate: '',
    search: '',
  });

  useEffect(() => {
    if (project) {
      fetchData();
    }
  }, [project]);

  useEffect(() => {
    applyFilters();
  }, [tasks, filters]);

  const fetchData = async () => {
    try {
      const [statusesResponse, tasksResponse] = await Promise.all([
        supabase
          .from('task_statuses')
          .select('*')
          .eq('project_id', project.id)
          .order('order_index'),
        supabase
          .from('tasks')
          .select('*')
          .eq('project_id', project.id)
          .order('order_index'),
      ]);

      if (statusesResponse.error) throw statusesResponse.error;
      if (tasksResponse.error) throw tasksResponse.error;

      setStatuses(statusesResponse.data || []);
      setTasks(tasksResponse.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...tasks];

    // Filter by search
    if (filters.search) {
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        task.description.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    // Filter by priority
    if (filters.priority.length > 0) {
      filtered = filtered.filter(task => filters.priority.includes(task.priority));
    }

    // Filter by assignee
    if (filters.assignee.length > 0) {
      filtered = filtered.filter(task => 
        task.assignee_id && filters.assignee.includes(task.assignee_id)
      );
    }

    // Filter by due date
    if (filters.dueDate) {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);

      filtered = filtered.filter(task => {
        if (!task.due_date) return false;
        const dueDate = new Date(task.due_date);
        
        switch (filters.dueDate) {
          case 'overdue':
            return dueDate < today;
          case 'today':
            return dueDate.toDateString() === today.toDateString();
          case 'tomorrow':
            return dueDate.toDateString() === tomorrow.toDateString();
          case 'week':
            return dueDate <= nextWeek && dueDate >= today;
          default:
            return true;
        }
      });
    }

    setFilteredTasks(filtered);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find(t => t.id === event.active.id);
    setDraggedTask(task || null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setDraggedTask(null);

    if (!over) return;

    const taskId = active.id as string;
    const newStatusId = over.id as string;
    const task = tasks.find(t => t.id === taskId);

    if (!task || task.status_id === newStatusId) return;

    // Optimistic update
    setTasks(tasks.map(t => 
      t.id === taskId ? { ...t, status_id: newStatusId } : t
    ));

    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status_id: newStatusId })
        .eq('id', taskId);

      if (error) throw error;

      const newStatus = statuses.find(s => s.id === newStatusId);
      toast.success('Tâche déplacée', {
        description: `"${task.title}" → ${newStatus?.name}`,
        duration: 2000,
      });
    } catch (error) {
      console.error('Error updating task:', error);
      // Revert optimistic update
      setTasks(tasks.map(t => 
        t.id === taskId ? { ...t, status_id: task.status_id } : t
      ));
      toast.error('Erreur lors du déplacement de la tâche');
    }
  };

  const handleTaskCreated = (task: Task) => {
    setTasks([...tasks, task]);
    setShowCreateDialog(false);
  };

  const handleTaskUpdated = (updatedTask: Task) => {
    setTasks(tasks.map(task => 
      task.id === updatedTask.id ? updatedTask : task
    ));
    setSelectedTask(updatedTask);
    toast.success('Tâche mise à jour', {
      description: `"${updatedTask.title}" a été modifiée`,
      duration: 2000,
    });
  };

  const handleTaskDeleted = (deletedTaskId: string) => {
    const deletedTask = tasks.find(t => t.id === deletedTaskId);
    setTasks(tasks.filter(task => task.id !== deletedTaskId));
    setSelectedTask(null);
    toast.success('Tâche supprimée', {
      description: deletedTask ? `"${deletedTask.title}" a été supprimée` : 'Tâche supprimée',
      duration: 2000,
    });
  };

  const getTasksByStatus = (statusId: string) => {
    return filteredTasks.filter(task => task.status_id === statusId);
  };

  const getProjectStats = () => {
    const total = tasks.length;
    const completed = tasks.filter(t => {
      const status = statuses.find(s => s.id === t.status_id);
      return status?.name.toLowerCase().includes('terminé') || status?.name.toLowerCase().includes('done');
    }).length;
    const overdue = tasks.filter(t => t.due_date && new Date(t.due_date) < new Date()).length;
    const urgent = tasks.filter(t => t.priority === 'urgent').length;

    return { total, completed, overdue, urgent };
  };

  const stats = getProjectStats();

  if (loading) {
    return (
      <div className="flex-1 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-64"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-gray-100 rounded"></div>
            ))}
          </div>
          <div className="flex space-x-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex-1 space-y-3">
                <div className="h-6 bg-gray-200 rounded"></div>
                <div className="space-y-2">
                  <div className="h-20 bg-gray-100 rounded"></div>
                  <div className="h-20 bg-gray-100 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
            <p className="text-gray-600">{project.description}</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="mr-2 h-4 w-4" />
              Filtres
            </Button>
            <Button
              onClick={() => setShowCreateDialog(true)}
              className="bg-gradient-to-r from-[#667EEA] to-[#764BA2] hover:from-[#5A67D8] hover:to-[#6B46C1]"
            >
              <Plus className="mr-2 h-4 w-4" />
              Nouvelle tâche
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">tâches au total</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Terminées</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
              <p className="text-xs text-muted-foreground">
                {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}% du total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">En retard</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
              <p className="text-xs text-muted-foreground">nécessitent attention</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Urgentes</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.urgent}</div>
              <p className="text-xs text-muted-foreground">priorité maximale</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        {showFilters && (
          <TaskFilters
            filters={filters}
            onFiltersChange={setFilters}
            tasks={tasks}
            statuses={statuses}
          />
        )}
      </div>

      {/* Kanban Board */}
      <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex space-x-6 overflow-x-auto pb-6">
          <SortableContext items={statuses.map(s => s.id)} strategy={horizontalListSortingStrategy}>
            {statuses.map((status) => (
              <KanbanColumn
                key={status.id}
                status={status}
                tasks={getTasksByStatus(status.id)}
                onTaskClick={setSelectedTask}
                isDraggedOver={draggedTask !== null}
              />
            ))}
          </SortableContext>
        </div>
        
        <DragOverlay>
          {draggedTask ? (
            <div className="rotate-3 opacity-90">
              <KanbanCard
                task={draggedTask}
                onClick={() => {}}
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Dialogs */}
      <CreateTaskDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        project={project}
        statuses={statuses}
        onTaskCreated={handleTaskCreated}
      />

      {selectedTask && (
        <TaskDetailsDialog
          open={!!selectedTask}
          onOpenChange={(open) => !open && setSelectedTask(null)}
          task={selectedTask}
          statuses={statuses}
          onTaskUpdated={handleTaskUpdated}
          onTaskDeleted={handleTaskDeleted}
        />
      )}
    </div>
  );
}