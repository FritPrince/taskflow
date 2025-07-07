'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { type Task, type TaskStatus } from '@/lib/supabase';
import { Search, X, Filter } from 'lucide-react';

interface TaskFiltersProps {
  filters: {
    priority: string[];
    assignee: string[];
    dueDate: string;
    search: string;
  };
  onFiltersChange: (filters: any) => void;
  tasks: Task[];
  statuses: TaskStatus[];
}

export function TaskFilters({ filters, onFiltersChange, tasks, statuses }: TaskFiltersProps) {
  const priorities = ['low', 'medium', 'high', 'urgent'];
  const dueDateOptions = [
    { value: '', label: 'Toutes les dates' },
    { value: 'overdue', label: 'En retard' },
    { value: 'today', label: "Aujourd'hui" },
    { value: 'tomorrow', label: 'Demain' },
    { value: 'week', label: 'Cette semaine' },
  ];

  const handlePriorityChange = (priority: string, checked: boolean) => {
    const newPriorities = checked
      ? [...filters.priority, priority]
      : filters.priority.filter(p => p !== priority);
    
    onFiltersChange({ ...filters, priority: newPriorities });
  };

  const clearFilters = () => {
    onFiltersChange({
      priority: [],
      assignee: [],
      dueDate: '',
      search: '',
    });
  };

  const hasActiveFilters = filters.priority.length > 0 || 
                          filters.assignee.length > 0 || 
                          filters.dueDate || 
                          filters.search;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Filter className="mr-2 h-5 w-5" />
            Filtres
          </div>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="mr-1 h-4 w-4" />
              Effacer
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="space-y-2">
            <Label htmlFor="search">Recherche</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="search"
                placeholder="Rechercher une tâche..."
                value={filters.search}
                onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
                className="pl-10"
              />
            </div>
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <Label>Priorité</Label>
            <div className="space-y-2">
              {priorities.map((priority) => (
                <div key={priority} className="flex items-center space-x-2">
                  <Checkbox
                    id={`priority-${priority}`}
                    checked={filters.priority.includes(priority)}
                    onCheckedChange={(checked) => handlePriorityChange(priority, checked as boolean)}
                  />
                  <Label htmlFor={`priority-${priority}`} className="flex items-center">
                    <Badge className={`text-xs ${getPriorityColor(priority)}`}>
                      {priority}
                    </Badge>
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <Label htmlFor="due-date">Échéance</Label>
            <Select value={filters.dueDate} onValueChange={(value) => onFiltersChange({ ...filters, dueDate: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {dueDateOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label>Statut</Label>
            <div className="text-sm text-gray-500">
              {statuses.length} colonnes disponibles
            </div>
          </div>
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex flex-wrap gap-2">
              {filters.search && (
                <Badge variant="secondary">
                  Recherche: "{filters.search}"
                </Badge>
              )}
              {filters.priority.map((priority) => (
                <Badge key={priority} className={getPriorityColor(priority)}>
                  {priority}
                </Badge>
              ))}
              {filters.dueDate && (
                <Badge variant="secondary">
                  {dueDateOptions.find(opt => opt.value === filters.dueDate)?.label}
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}