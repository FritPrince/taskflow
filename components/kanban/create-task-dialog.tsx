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
import { supabase, type Project, type Task, type TaskStatus } from '@/lib/supabase';
import { useAuth } from '@/hooks/use-auth';
import { Loader2, Calendar, Clock, Flag, User, Tag, FileText, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface CreateTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: Project;
  statuses: TaskStatus[];
  onTaskCreated: (task: Task) => void;
}

export function CreateTaskDialog({ 
  open, 
  onOpenChange, 
  project, 
  statuses, 
  onTaskCreated 
}: CreateTaskDialogProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    statusId: statuses[0]?.id || '',
    dueDate: '',
    estimatedHours: '',
    tags: '',
    isBlocking: false,
    assignToSelf: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData.title.trim()) {
      toast.error('Le titre de la tâche est requis');
      return;
    }

    setLoading(true);
    try {
      console.log('Creating task with data:', formData);
      
      const taskData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        priority: formData.priority,
        status_id: formData.statusId,
        project_id: project.id,
        creator_id: user.id,
        assignee_id: formData.assignToSelf ? user.id : null,
        due_date: formData.dueDate || null,
        estimated_hours: formData.estimatedHours ? parseInt(formData.estimatedHours) : null,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
        is_blocking: formData.isBlocking,
      };

      const { data, error } = await supabase
        .from('tasks')
        .insert([taskData])
        .select()
        .single();

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      console.log('Task created successfully:', data);
      onTaskCreated(data);
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        statusId: statuses[0]?.id || '',
        dueDate: '',
        estimatedHours: '',
        tags: '',
        isBlocking: false,
        assignToSelf: true,
      });

      toast.success('Tâche créée avec succès !', {
        description: `"${formData.title}" a été ajoutée au projet`,
        duration: 3000,
      });

      onOpenChange(false);
    } catch (error: any) {
      console.error('Error creating task:', error);
      toast.error('Erreur lors de la création', {
        description: error.message || 'Une erreur inattendue est survenue',
        duration: 5000,
      });
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

  const handleClose = () => {
    if (!loading) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <FileText className="mr-2 h-5 w-5" />
            Créer une nouvelle tâche
          </DialogTitle>
          <DialogDescription>
            Ajoutez une tâche détaillée à votre projet {project.name}.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Titre et Description */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="flex items-center">
                <Tag className="mr-1 h-4 w-4" />
                Titre de la tâche *
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Ex: Créer la page d'accueil responsive"
                required
                disabled={loading}
                className="text-base"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description" className="flex items-center">
                <FileText className="mr-1 h-4 w-4" />
                Description détaillée
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Décrivez la tâche en détail, les critères d'acceptation, les ressources nécessaires..."
                rows={4}
                disabled={loading}
              />
            </div>
          </div>

          {/* Priorité et Statut */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority" className="flex items-center">
                <Flag className="mr-1 h-4 w-4" />
                Priorité
              </Label>
              <Select 
                value={formData.priority} 
                onValueChange={(value: any) => setFormData(prev => ({ ...prev, priority: value }))}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">
                    <div className="flex items-center">
                      <Badge className="mr-2 bg-green-100 text-green-800">Basse</Badge>
                    </div>
                  </SelectItem>
                  <SelectItem value="medium">
                    <div className="flex items-center">
                      <Badge className="mr-2 bg-yellow-100 text-yellow-800">Moyenne</Badge>
                    </div>
                  </SelectItem>
                  <SelectItem value="high">
                    <div className="flex items-center">
                      <Badge className="mr-2 bg-orange-100 text-orange-800">Haute</Badge>
                    </div>
                  </SelectItem>
                  <SelectItem value="urgent">
                    <div className="flex items-center">
                      <Badge className="mr-2 bg-red-100 text-red-800">Urgente</Badge>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">Statut initial</Label>
              <Select 
                value={formData.statusId} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, statusId: value }))}
                disabled={loading}
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

          {/* Date d'échéance et Estimation */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="due-date" className="flex items-center">
                <Calendar className="mr-1 h-4 w-4" />
                Date d échéance
              </Label>
              <Input
                id="due-date"
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                disabled={loading}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="estimated-hours" className="flex items-center">
                <Clock className="mr-1 h-4 w-4" />
                Estimation (heures)
              </Label>
              <Input
                id="estimated-hours"
                type="number"
                value={formData.estimatedHours}
                onChange={(e) => setFormData(prev => ({ ...prev, estimatedHours: e.target.value }))}
                placeholder="Ex: 8"
                min="0.5"
                step="0.5"
                disabled={loading}
              />
            </div>
          </div>

          {/* Tags et Options */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tags">Tags (séparés par des virgules)</Label>
              <Input
                id="tags"
                value={formData.tags}
                onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                placeholder="Ex: frontend, urgent, design"
                disabled={loading}
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Switch
                  id="assign-to-self"
                  checked={formData.assignToSelf}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, assignToSelf: checked }))}
                  disabled={loading}
                />
                <Label htmlFor="assign-to-self" className="flex items-center">
                  <User className="mr-1 h-4 w-4" />
                  M assigner cette tâche
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="is-blocking"
                  checked={formData.isBlocking}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isBlocking: checked }))}
                  disabled={loading}
                />
                <Label htmlFor="is-blocking" className="flex items-center">
                  <AlertCircle className="mr-1 h-4 w-4" />
                  Tâche bloquante (priorité absolue)
                </Label>
              </div>
            </div>
          </div>

          {/* Aperçu de la priorité */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-2">Aperçu de la tâche</h4>
            <div className="flex items-center space-x-2 mb-2">
              <Badge className={getPriorityColor(formData.priority)}>
                {formData.priority}
              </Badge>
              {formData.isBlocking && (
                <Badge className="bg-red-100 text-red-800">Bloquante</Badge>
              )}
              {formData.dueDate && (
                <Badge variant="outline">
                  Échéance: {new Date(formData.dueDate).toLocaleDateString('fr-FR')}
                </Badge>
              )}
            </div>
            <p className="text-sm text-gray-600">
              {formData.title || 'Titre de la tâche...'}
            </p>
          </div>
          
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              disabled={loading}
            >
              Annuler
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !formData.title.trim()}
              className="bg-gradient-to-r from-[#667EEA] to-[#764BA2] hover:from-[#5A67D8] hover:to-[#6B46C1]"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Création...
                </>
              ) : (
                <>
                  <FileText className="mr-2 h-4 w-4" />
                  Créer la tâche
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}