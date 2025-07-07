'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { CheckSquare, Plus, GripVertical, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  order: number;
}

interface TaskChecklistProps {
  taskId: string;
}

export function TaskChecklist({ taskId }: TaskChecklistProps) {
  const [items, setItems] = useState<ChecklistItem[]>([
    { id: '1', text: 'Analyser les requirements', completed: true, order: 0 },
    { id: '2', text: 'Créer les wireframes', completed: true, order: 1 },
    { id: '3', text: 'Développer les composants', completed: false, order: 2 },
    { id: '4', text: 'Tests unitaires', completed: false, order: 3 },
    { id: '5', text: 'Tests d\'intégration', completed: false, order: 4 },
  ]);
  const [newItemText, setNewItemText] = useState('');

  const completedCount = items.filter(item => item.completed).length;
  const progress = items.length > 0 ? (completedCount / items.length) * 100 : 0;

  const toggleItem = (id: string) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
    
    const item = items.find(i => i.id === id);
    if (item) {
      toast.success(
        item.completed ? '☑️ Élément décoché' : '✅ Élément terminé',
        { description: item.text }
      );
    }
  };

  const addItem = () => {
    if (!newItemText.trim()) return;
    
    const newItem: ChecklistItem = {
      id: Date.now().toString(),
      text: newItemText.trim(),
      completed: false,
      order: items.length
    };
    
    setItems([...items, newItem]);
    setNewItemText('');
    toast.success('➕ Élément ajouté à la checklist');
  };

  const deleteItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
    toast.success('🗑️ Élément supprimé');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addItem();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <CheckSquare className="mr-2 h-5 w-5" />
            Checklist ({completedCount}/{items.length})
          </div>
          <span className="text-sm font-normal text-gray-500">
            {Math.round(progress)}%
          </span>
        </CardTitle>
        <Progress value={progress} className="h-2" />
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Checklist Items */}
        <div className="space-y-2">
          {items.map((item) => (
            <div key={item.id} className="flex items-center space-x-3 group">
              <GripVertical className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab" />
              
              <Checkbox
                checked={item.completed}
                onCheckedChange={() => toggleItem(item.id)}
                className="data-[state=checked]:bg-green-600"
              />
              
              <span className={`flex-1 text-sm ${
                item.completed 
                  ? 'line-through text-gray-500' 
                  : 'text-gray-900'
              }`}>
                {item.text}
              </span>
              
              <Button
                variant="ghost"
                size="sm"
                className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                onClick={() => deleteItem(item.id)}
              >
                <Trash2 className="h-3 w-3 text-red-500" />
              </Button>
            </div>
          ))}
        </div>

        {/* Add New Item */}
        <div className="flex space-x-2">
          <Input
            value={newItemText}
            onChange={(e) => setNewItemText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ajouter un élément..."
            className="flex-1"
          />
          <Button onClick={addItem} size="sm" disabled={!newItemText.trim()}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Quick Actions */}
        {items.length > 0 && (
          <div className="flex justify-between text-xs text-gray-500 pt-2 border-t">
            <span>{items.filter(i => !i.completed).length} restant(s)</span>
            <div className="space-x-2">
              <button 
                className="hover:text-gray-700"
                onClick={() => setItems(items.map(i => ({ ...i, completed: true })))}
              >
                Tout cocher
              </button>
              <button 
                className="hover:text-gray-700"
                onClick={() => setItems(items.filter(i => !i.completed))}
              >
                Supprimer terminés
              </button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}