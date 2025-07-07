'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { type Task } from '@/lib/supabase';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Calendar, Clock, User, Flag, AlertTriangle, MessageSquare, Paperclip } from 'lucide-react';

interface KanbanCardProps {
  task: Task & {
    is_blocking?: boolean;
    estimated_hours?: number;
    tags?: string[];
  };
  onClick: () => void;
}

export function KanbanCard({ task, onClick }: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent': return <AlertTriangle className="h-3 w-3" />;
      case 'high': return <Flag className="h-3 w-3" />;
      default: return null;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { text: `${Math.abs(diffDays)}j en retard`, color: 'text-red-600' };
    } else if (diffDays === 0) {
      return { text: "Aujourd'hui", color: 'text-orange-600' };
    } else if (diffDays === 1) {
      return { text: 'Demain', color: 'text-yellow-600' };
    } else if (diffDays <= 7) {
      return { text: `${diffDays}j restants`, color: 'text-blue-600' };
    } else {
      return { 
        text: date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }), 
        color: 'text-gray-600' 
      };
    }
  };

  const isOverdue = task.due_date && new Date(task.due_date) < new Date();
  const dueDateInfo = task.due_date ? formatDate(task.due_date) : null;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`bg-white p-4 rounded-lg border border-gray-200 shadow-sm cursor-pointer transition-all hover:shadow-md hover:border-gray-300 group ${
        isDragging ? 'opacity-50 rotate-2 scale-105' : ''
      } ${isOverdue ? 'border-l-4 border-l-red-500' : ''}`}
      onClick={onClick}
    >
      <div className="space-y-3">
        {/* Header with priority and blocking indicator */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            <Badge className={`text-xs ${getPriorityColor(task.priority)} flex items-center space-x-1`}>
              {getPriorityIcon(task.priority)}
              <span>{task.priority}</span>
            </Badge>
            {task.is_blocking && (
              <Badge className="bg-red-100 text-red-800 text-xs">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Bloquante
              </Badge>
            )}
          </div>
          {task.estimated_hours && (
            <Badge variant="outline" className="text-xs">
              <Clock className="h-3 w-3 mr-1" />
              {task.estimated_hours}h
            </Badge>
          )}
        </div>
        
        {/* Title */}
        <h4 className="font-medium text-gray-900 line-clamp-2 group-hover:text-[#667EEA] transition-colors">
          {task.title}
        </h4>
        
        {/* Description */}
        {task.description && (
          <p className="text-sm text-gray-600 line-clamp-2">{task.description}</p>
        )}

        {/* Tags */}
        {task.tags && task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {task.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {task.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{task.tags.length - 3}
              </Badge>
            )}
          </div>
        )}
        
        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-3">
            {/* Due date */}
            {dueDateInfo && (
              <div className={`flex items-center space-x-1 ${dueDateInfo.color}`}>
                <Calendar className="h-3 w-3" />
                <span className="font-medium">{dueDateInfo.text}</span>
              </div>
            )}
            
            {/* Created date */}
            <div className="flex items-center space-x-1">
              <Clock className="h-3 w-3" />
              <span>{new Date(task.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</span>
            </div>
          </div>
          
          {/* Assignee */}
          {task.assignee_id && (
            <Avatar className="h-6 w-6">
              <AvatarFallback className="text-xs bg-gradient-to-br from-[#667EEA] to-[#764BA2] text-white">
                {task.assignee_id.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          )}
        </div>

        {/* Progress indicator for blocking tasks */}
        {task.is_blocking && (
          <div className="w-full bg-red-100 rounded-full h-1">
            <div className="bg-red-500 h-1 rounded-full w-full animate-pulse"></div>
          </div>
        )}
      </div>
    </div>
  );
}