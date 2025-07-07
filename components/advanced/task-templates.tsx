'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { BookTemplate as FileTemplate, Plus, Copy, Edit, Trash2, Zap } from 'lucide-react';
import { toast } from 'sonner';

interface TaskTemplate {
  id: string;
  name: string;
  title: string;
  description: string;
  priority: string;
  tags: string[];
  checklist: string[];
  estimatedHours: number;
}

export function TaskTemplates() {
  const [templates, setTemplates] = useState<TaskTemplate[]>([
    {
      id: '1',
      name: 'Bug Fix',
      title: 'Correction de bug - [TITRE]',
      description: '## Description du bug\n\n## Étapes pour reproduire\n1. \n2. \n3. \n\n## Comportement attendu\n\n## Comportement actuel\n\n## Solution proposée',
      priority: 'high',
      tags: ['bug', 'urgent'],
      checklist: ['Reproduire le bug', 'Identifier la cause', 'Implémenter la correction', 'Tester la correction', 'Documenter'],
      estimatedHours: 4
    },
    {
      id: '2',
      name: 'Feature Development',
      title: 'Nouvelle fonctionnalité - [TITRE]',
      description: '## Objectif\n\n## Spécifications\n\n## Critères d\'acceptation\n- [ ] \n- [ ] \n- [ ] \n\n## Notes techniques',
      priority: 'medium',
      tags: ['feature', 'development'],
      checklist: ['Analyser les requirements', 'Créer les wireframes', 'Développer', 'Tests unitaires', 'Tests d\'intégration', 'Documentation'],
      estimatedHours: 16
    },
    {
      id: '3',
      name: 'Code Review',
      title: 'Review - [TITRE]',
      description: '## Pull Request\nLien: \n\n## Points à vérifier\n- [ ] Code quality\n- [ ] Tests\n- [ ] Documentation\n- [ ] Performance\n\n## Commentaires',
      priority: 'medium',
      tags: ['review', 'quality'],
      checklist: ['Vérifier le code', 'Tester les changements', 'Valider les tests', 'Approuver ou demander des modifications'],
      estimatedHours: 2
    }
  ]);

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<TaskTemplate | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    description: '',
    priority: 'medium',
    tags: '',
    checklist: '',
    estimatedHours: 8
  });

  const resetForm = () => {
    setFormData({
      name: '',
      title: '',
      description: '',
      priority: 'medium',
      tags: '',
      checklist: '',
      estimatedHours: 8
    });
    setEditingTemplate(null);
  };

  const handleSave = () => {
    const template: TaskTemplate = {
      id: editingTemplate?.id || Date.now().toString(),
      name: formData.name,
      title: formData.title,
      description: formData.description,
      priority: formData.priority,
      tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
      checklist: formData.checklist.split('\n').map(t => t.trim()).filter(Boolean),
      estimatedHours: formData.estimatedHours
    };

    if (editingTemplate) {
      setTemplates(templates.map(t => t.id === editingTemplate.id ? template : t));
      toast.success('📝 Template mis à jour');
    } else {
      setTemplates([...templates, template]);
      toast.success('✨ Template créé');
    }

    setShowCreateDialog(false);
    resetForm();
  };

  const handleEdit = (template: TaskTemplate) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      title: template.title,
      description: template.description,
      priority: template.priority,
      tags: template.tags.join(', '),
      checklist: template.checklist.join('\n'),
      estimatedHours: template.estimatedHours
    });
    setShowCreateDialog(true);
  };

  const handleDelete = (id: string) => {
    setTemplates(templates.filter(t => t.id !== id));
    toast.success('🗑️ Template supprimé');
  };

  const handleUseTemplate = (template: TaskTemplate) => {
    // This would typically open the create task dialog with pre-filled data
    toast.success('🚀 Template appliqué', {
      description: `Utilisation du template "${template.name}"`
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Templates de Tâches</h2>
          <p className="text-gray-600">Créez des modèles pour accélérer la création de tâches</p>
        </div>
        
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Nouveau Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingTemplate ? 'Modifier le Template' : 'Créer un Template'}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="template-name">Nom du template</Label>
                  <Input
                    id="template-name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ex: Bug Fix, Feature Development"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="template-priority">Priorité par défaut</Label>
                  <Select value={formData.priority} onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}>
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
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="template-title">Titre de la tâche</Label>
                <Input
                  id="template-title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Ex: Correction de bug - [TITRE] (utilisez [TITRE] comme placeholder)"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="template-description">Description (Markdown supporté)</Label>
                <Textarea
                  id="template-description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={8}
                  placeholder="## Description&#10;&#10;## Étapes&#10;1. &#10;2. &#10;&#10;## Critères d'acceptation&#10;- [ ] &#10;- [ ] "
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="template-tags">Tags (séparés par des virgules)</Label>
                  <Input
                    id="template-tags"
                    value={formData.tags}
                    onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                    placeholder="bug, urgent, frontend"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="template-hours">Estimation (heures)</Label>
                  <Input
                    id="template-hours"
                    type="number"
                    value={formData.estimatedHours}
                    onChange={(e) => setFormData(prev => ({ ...prev, estimatedHours: parseInt(e.target.value) || 0 }))}
                    min="0.5"
                    step="0.5"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="template-checklist">Checklist (une ligne par élément)</Label>
                <Textarea
                  id="template-checklist"
                  value={formData.checklist}
                  onChange={(e) => setFormData(prev => ({ ...prev, checklist: e.target.value }))}
                  rows={4}
                  placeholder="Analyser le problème&#10;Implémenter la solution&#10;Tester&#10;Documenter"
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Annuler
                </Button>
                <Button onClick={handleSave}>
                  {editingTemplate ? 'Mettre à jour' : 'Créer'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => (
          <Card key={template.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <FileTemplate className="mr-2 h-5 w-5" />
                  {template.name}
                </div>
                <Badge className={getPriorityColor(template.priority)}>
                  {template.priority}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-700">Titre:</p>
                <p className="text-sm text-gray-600">{template.title}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-700">Description:</p>
                <p className="text-sm text-gray-600 line-clamp-3">
                  {template.description.substring(0, 100)}...
                </p>
              </div>
              
              <div className="flex flex-wrap gap-1">
                {template.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
              
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>{template.checklist.length} étapes</span>
                <span>{template.estimatedHours}h estimées</span>
              </div>
              
              <div className="flex space-x-2">
                <Button 
                  size="sm" 
                  className="flex-1"
                  onClick={() => handleUseTemplate(template)}
                >
                  <Zap className="mr-1 h-3 w-3" />
                  Utiliser
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleEdit(template)}
                >
                  <Edit className="h-3 w-3" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleDelete(template.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}