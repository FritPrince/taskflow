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
import { supabase, type Project } from '@/lib/supabase';
import { useAuth } from '@/hooks/use-auth';
import { Loader2, FolderPlus, Palette, Target, Users } from 'lucide-react';
import { toast } from 'sonner';

interface CreateProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProjectCreated: (project: Project) => void;
}

const projectTemplates = [
  {
    id: 'blank',
    name: 'Projet vierge',
    description: 'Commencer avec un projet vide',
    icon: '📋',
  },
  {
    id: 'web-dev',
    name: 'Développement Web',
    description: 'Template pour projets web',
    icon: '💻',
  },
  {
    id: 'marketing',
    name: 'Campagne Marketing',
    description: 'Gestion de campagnes marketing',
    icon: '📈',
  },
  {
    id: 'design',
    name: 'Projet Design',
    description: 'Workflow créatif et design',
    icon: '🎨',
  },
];

const projectColors = [
  { name: 'Bleu', value: '#3B82F6' },
  { name: 'Violet', value: '#8B5CF6' },
  { name: 'Vert', value: '#10B981' },
  { name: 'Orange', value: '#F59E0B' },
  { name: 'Rouge', value: '#EF4444' },
  { name: 'Rose', value: '#EC4899' },
];

export function CreateProjectDialog({ open, onOpenChange, onProjectCreated }: CreateProjectDialogProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    template: 'blank',
    color: '#3B82F6',
    isPublic: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData.name.trim()) {
      toast.error('Le nom du projet est requis');
      return;
    }

    setLoading(true);

    try {
      console.log('Creating project with user:', user.id);
      
      const { data, error: insertError } = await supabase
        .from('projects')
        .insert([
          {
            name: formData.name.trim(),
            description: formData.description.trim() || '',
            owner_id: user.id,
          },
        ])
        .select()
        .single();

      if (insertError) {
        console.error('Insert error:', insertError);
        throw insertError;
      }

      console.log('Project created successfully:', data);
      
      toast.success('Projet créé avec succès !', {
        description: `"${formData.name}" est prêt à être utilisé`,
        duration: 3000,
      });

      onProjectCreated(data);
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        template: 'blank',
        color: '#3B82F6',
        isPublic: false,
      });
      setStep(1);
      
      onOpenChange(false);

    } catch (error: any) {
      console.error('Error creating project:', error);
      toast.error('Erreur lors de la création', {
        description: error.message || 'Une erreur inattendue est survenue',
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({
        name: '',
        description: '',
        template: 'blank',
        color: '#3B82F6',
        isPublic: false,
      });
      setStep(1);
      onOpenChange(false);
    }
  };

  const nextStep = () => {
    if (step === 1 && !formData.name.trim()) {
      toast.error('Le nom du projet est requis');
      return;
    }
    setStep(step + 1);
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <FolderPlus className="mr-2 h-5 w-5" />
            Créer un nouveau projet
          </DialogTitle>
          <DialogDescription>
            {step === 1 ? 'Donnez un nom et une description à votre projet.' : 
             step === 2 ? 'Choisissez un template pour démarrer rapidement.' :
             'Personnalisez l\'apparence de votre projet.'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {step === 1 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center">
                  <Target className="mr-1 h-4 w-4" />
                  Nom du projet *
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Refonte du site web"
                  required
                  disabled={loading}
                  className="text-base"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (optionnel)</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Décrivez votre projet, ses objectifs, son contexte..."
                  rows={3}
                  disabled={loading}
                />
              </div>
            </>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <Label>Choisir un template</Label>
              <div className="grid grid-cols-2 gap-3">
                {projectTemplates.map((template) => (
                  <div
                    key={template.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                      formData.template === template.id
                        ? 'border-[#667EEA] bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setFormData(prev => ({ ...prev, template: template.id }))}
                  >
                    <div className="text-2xl mb-2">{template.icon}</div>
                    <h4 className="font-medium text-sm">{template.name}</h4>
                    <p className="text-xs text-gray-500 mt-1">{template.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="flex items-center">
                  <Palette className="mr-1 h-4 w-4" />
                  Couleur du projet
                </Label>
                <div className="flex flex-wrap gap-2">
                  {projectColors.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        formData.color === color.value
                          ? 'border-gray-800 scale-110'
                          : 'border-gray-300 hover:scale-105'
                      }`}
                      style={{ backgroundColor: color.value }}
                      onClick={() => setFormData(prev => ({ ...prev, color: color.value }))}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">Aperçu du projet</h4>
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: formData.color }}
                  />
                  <div>
                    <p className="font-medium">{formData.name || 'Nom du projet'}</p>
                    <p className="text-sm text-gray-600">
                      {formData.description || 'Description du projet'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div className="flex justify-between pt-4 border-t">
            <div>
              {step > 1 && (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={prevStep}
                  disabled={loading}
                >
                  Précédent
                </Button>
              )}
            </div>
            
            <div className="flex space-x-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleClose}
                disabled={loading}
              >
                Annuler
              </Button>
              
              {step < 3 ? (
                <Button 
                  type="button" 
                  onClick={nextStep}
                  disabled={loading || (step === 1 && !formData.name.trim())}
                  className="bg-gradient-to-r from-[#667EEA] to-[#764BA2] hover:from-[#5A67D8] hover:to-[#6B46C1]"
                >
                  Suivant
                </Button>
              ) : (
                <Button 
                  type="submit" 
                  disabled={loading || !formData.name.trim()}
                  className="bg-gradient-to-r from-[#667EEA] to-[#764BA2] hover:from-[#5A67D8] hover:to-[#6B46C1]"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Création...
                    </>
                  ) : (
                    <>
                      <FolderPlus className="mr-2 h-4 w-4" />
                      Créer le projet
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}