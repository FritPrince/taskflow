'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { KanbanCard } from './kanban-card';
import { type Task, type TaskStatus } from '@/lib/supabase';
import { Badge } from '@/components/ui/badge';

interface KanbanColumnProps {
  status: TaskStatus;
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  isDraggedOver: boolean;
}

export function KanbanColumn({ status, tasks, onTaskClick, isDraggedOver }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: status.id,
  });

  return (
    <div className="flex-shrink-0 w-80">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">{status.name}</h3>
            <Badge variant="secondary" className="bg-gray-100 text-gray-600">
              {tasks.length}
            </Badge>
          </div>
        </div>
        
        <div
          ref={setNodeRef}
          className={`p-4 min-h-[500px] transition-colors ${
            isOver ? 'bg-blue-50' : 'bg-white'
          }`}
        >
          <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
              {tasks.map((task) => (
                <KanbanCard
                  key={task.id}
                  task={task}
                  onClick={() => onTaskClick(task)}
                />
              ))}
            </div>
          </SortableContext>
          
          {tasks.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              <p className="text-sm">Aucune tâche</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}