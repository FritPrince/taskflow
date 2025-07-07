'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { supabase, type Task, type TaskStatus } from '@/lib/supabase';
import { TimeTracker } from '@/components/advanced/time-tracker';
import { TaskComments } from '@/components/advanced/task-comments';
import { TaskChecklist } from '@/components/advanced/task-checklist';
import { TaskAttachments } from '@/components/advanced/task-attachments';
import { Loader2, Edit2, Trash2, Calendar, Clock, User, Flag, AlertTriangle, MessageSquare, History, FileText, Timer, CheckSquare, Paperclip } from 'lucide-react';
import { toast } from 'sonner';

interface TaskDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task & {
    estimated_hours?: number;
    is_blocking?: boolean;
    tags?: string[];
    assignee_id?: string | null;
  };
  statuses: TaskStatus[];
  onTaskUpdated: (task: Task) => void;
  onTaskDeleted: (taskId: string) => void;
}

export function TaskDetailsDialog({
  open,
  onOpenChange,
  task,
  statuses,
  onTaskUpdated,
  onTaskDeleted,
}: TaskDetailsDialogProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: task.title,
    description: task.description,
    priority: task.priority,
    statusId: task.status_id || '',
    dueDate: task.due_date || '',
    estimatedHours: task.estimated_hours?.toString() || '',
    tags: task.tags?.join(', ') || '',
    isBlocking: task.is_blocking || false,
  });

  const handleSave = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('tasks')
        .update({
          title: formData.title,
          description: formData.description,
          priority: formData.priority,
          status_id: formData.statusId,
          due_date: formData.dueDate || null,
          estimated_hours: formData.estimatedHours ? parseInt(formData.estimatedHours) : null,
          tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
          is_blocking: formData.isBlocking,
        })
        .eq('id', task.id)
        .select()
        .single();

      if (error) throw error;
      
      onTaskUpdated(data);
      setIsEditing(false);
      toast.success('✅ Tâche mise à jour');
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('❌ Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette tâche ? Cette action est irréversible.')) return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', task.id);

      if (error) throw error;
      
      onTaskDeleted(task.id);
      toast.success('🗑️ Tâche supprimée');
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('❌ Erreur lors de la suppression');
    } finally {
      setLoading(false);
    }
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const currentStatus = statuses.find(s => s.id === task.status_id);
  const isOverdue = task.due_date && new Date(task.due_date) < new Date();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl flex items-center">
              <FileText className="mr-2 h-5 w-5" />
              {isEditing ? 'Modifier la tâche' : task.title}
            </DialogTitle>
            <div className="flex items-center space-x-2">
              <Badge className={getPriorityColor(task.priority)}>
                {task.priority}
              </Badge>
              {task.is_blocking && (
                <Badge className="bg-red-100 text-red-800">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Bloquante
                </Badge>
              )}
              {!isEditing && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
          {!isEditing && (
            <DialogDescription>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mt-2">
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>Créée le {formatDate(task.created_at)}</span>
                </div>
                {task.due_date && (
                  <div className={`flex items-center space-x-1 ${isOverdue ? 'text-red-600' : ''}`}>
                    <Calendar className="h-4 w-4" />
                    <span>
                      Échéance: {new Date(task.due_date).toLocaleDateString('fr-FR')}
                      {isOverdue && ' (En retard)'}
                    </span>
                  </div>
                )}
                {currentStatus && (
                  <Badge variant="outline" className="ml-2">
                    {currentStatus.name}
                  </Badge>
                )}
                {task.estimated_hours && (
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>{task.estimated_hours}h estimées</span>
                  </div>
                )}
              </div>
            </DialogDescription>
          )}
        </DialogHeader>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="details">
              <FileText className="h-4 w-4 mr-1" />
              Détails
            </TabsTrigger>
            <TabsTrigger value="checklist">
              <CheckSquare className="h-4 w-4 mr-1" />
              Checklist
            </TabsTrigger>
            <TabsTrigger value="time">
              <Timer className="h-4 w-4 mr-1" />
              Temps
            </TabsTrigger>
            <TabsTrigger value="comments">
              <MessageSquare className="h-4 w-4 mr-1" />
              Commentaires
            </TabsTrigger>
            <TabsTrigger value="attachments">
              <Paperclip className="h-4 w-4 mr-1" />
              Fichiers
            </TabsTrigger>
            <TabsTrigger value="activity">
              <History className="h-4 w-4 mr-1" />
              Activité
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4">
            {isEditing ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="edit-title">Titre</Label>
                  <Input
                    id="edit-title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-description">Description</Label>
                  <Textarea
                    id="edit-description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={6}
                    placeholder="Décrivez la tâche en détail..."
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-priority">Priorité</Label>
                    <Select 
                      value={formData.priority} 
                      onValueChange={(value: any) => setFormData(prev => ({ ...prev, priority: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Basse</SelectItem>
                        <SelectItem value="medium">Moyenne</SelectItem>
                        <SelectItem value="high">Haute</SelectItem>
                        <SelectItem value="urgent">Urgente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="edit-status">Statut</Label>
                    <Select 
                      value={formData.statusId} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, statusId: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statuses.map((status) => (
                          <SelectItem key={status.id} value={status.id}>
                            <div className="flex items-center">
                              <div 
                                className="w-3 h-3 rounded-full mr-2" 
                                style={{ backgroundColor: status.color }}
                              />
                              {status.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-due-date">Date d échéance</Label>
                    <Input
                      id="edit-due-date"
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="edit-estimated-hours">Estimation (heures)</Label>
                    <Input
                      id="edit-estimated-hours"
                      type="number"
                      value={formData.estimatedHours}
                      onChange={(e) => setFormData(prev => ({ ...prev, estimatedHours: e.target.value }))}
                      placeholder="Ex: 8"
                      min="0.5"
                      step="0.5"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-tags">Tags (séparés par des virgules)</Label>
                  <Input
                    id="edit-tags"
                    value={formData.tags}
                    onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                    placeholder="Ex: frontend, urgent, design"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="edit-blocking"
                    checked={formData.isBlocking}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isBlocking: checked }))}
                  />
                  <Label htmlFor="edit-blocking" className="flex items-center">
                    <AlertTriangle className="mr-1 h-4 w-4" />
                    Tâche bloquante
                  </Label>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Description</Label>
                    <div className="mt-1 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-900 whitespace-pre-wrap">
                        {task.description || 'Aucune description'}
                      </p>
                    </div>
                  </div>

                  {task.tags && task.tags.length > 0 && (
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Tags</Label>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {task.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {task.assignee_id && (
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Assigné à</Label>
                      <div className="mt-1 flex items-center space-x-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs bg-gradient-to-br from-[#667EEA] to-[#764BA2] text-white">
                            {task.assignee_id.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-gray-900">{task.assignee_id}</span>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="checklist">
            <TaskChecklist taskId={task.id} />
          </TabsContent>

          <TabsContent value="time">
            <TimeTracker taskId={task.id} taskTitle={task.title} />
          </TabsContent>

          <TabsContent value="comments">
            <TaskComments taskId={task.id} />
          </TabsContent>

          <TabsContent value="attachments">
            <TaskAttachments taskId={task.id} />
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <History className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Tâche créée</p>
                  <p className="text-xs text-gray-500">{formatDate(task.created_at)}</p>
                </div>
              </div>
              
              {task.updated_at !== task.created_at && (
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Edit2 className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Tâche modifiée</p>
                    <p className="text-xs text-gray-500">{formatDate(task.updated_at)}</p>
                  </div>
                </div>
              )}

              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <MessageSquare className="h-4 w-4 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Commentaire ajouté</p>
                  <p className="text-xs text-gray-500">Il y a 2 heures</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <Paperclip className="h-4 w-4 text-orange-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Fichier ajouté</p>
                  <p className="text-xs text-gray-500">Il y a 1 jour</p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-between pt-4 border-t">
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Supprimer
          </Button>
          
          <div className="flex space-x-2">
            {isEditing ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                  disabled={loading}
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={loading}
                  className="bg-gradient-to-r from-[#667EEA] to-[#764BA2] hover:from-[#5A67D8] hover:to-[#6B46C1]"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    'Enregistrer'
                  )}
                </Button>
              </>
            ) : (
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Fermer
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}