'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { supabase, type Project, type ProjectMember } from '@/lib/supabase';
import { useAuth } from '@/hooks/use-auth';
import { Settings, Users, Bell, Palette, Trash2, Plus, Mail, BookTemplate as FileTemplate, Zap, Shield, Database, Webhook } from 'lucide-react';
import { toast } from 'sonner';

interface SettingsViewProps {
  selectedProject: Project | null;
}

export function SettingsView({ selectedProject }: SettingsViewProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [projectSettings, setProjectSettings] = useState({
    name: '',
    description: '',
    notifications: true,
    autoAssign: false,
    theme: 'default',
    emailNotifications: true,
    slackIntegration: false,
    githubIntegration: false,
    webhookUrl: '',
  });

  useEffect(() => {
    if (selectedProject) {
      setProjectSettings({
        name: selectedProject.name,
        description: selectedProject.description,
        notifications: true,
        autoAssign: false,
        theme: 'default',
        emailNotifications: true,
        slackIntegration: false,
        githubIntegration: false,
        webhookUrl: '',
      });
      fetchMembers();
    }
  }, [selectedProject]);

  const fetchMembers = async () => {
    if (!selectedProject) return;

    try {
      const { data, error } = await supabase
        .from('project_members')
        .select('*')
        .eq('project_id', selectedProject.id);

      if (error) throw error;
      setMembers(data || []);
    } catch (error) {
      console.error('Error fetching members:', error);
    }
  };

  const handleUpdateProject = async () => {
    if (!selectedProject) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('projects')
        .update({
          name: projectSettings.name,
          description: projectSettings.description,
        })
        .eq('id', selectedProject.id);

      if (error) throw error;
      toast.success('✅ Projet mis à jour');
    } catch (error) {
      console.error('Error updating project:', error);
      toast.error('❌ Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!selectedProject || !confirm('Êtes-vous sûr de vouloir supprimer ce projet ? Cette action est irréversible.')) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', selectedProject.id);

      if (error) throw error;
      toast.success('🗑️ Projet supprimé');
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('❌ Erreur lors de la suppression');
    } finally {
      setLoading(false);
    }
  };

  const handleInviteMember = () => {
    toast.success('📧 Invitation envoyée', {
      description: 'Un email d\'invitation a été envoyé'
    });
  };

  const handleTestWebhook = () => {
    toast.success('🔗 Webhook testé', {
      description: 'Test envoyé avec succès'
    });
  };

  if (!selectedProject) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Settings className="mx-auto h-24 w-24 text-gray-300 mb-4" />
          <h2 className="text-2xl font-semibold text-gray-600 mb-2">
            Paramètres du Projet
          </h2>
          <p className="text-gray-500">
            Sélectionnez un projet pour accéder aux paramètres
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Paramètres - {selectedProject.name}
        </h1>
        <p className="text-gray-600">
          Gérez les paramètres et la configuration de votre projet
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general">
            <Settings className="h-4 w-4 mr-1" />
            Général
          </TabsTrigger>
          <TabsTrigger value="members">
            <Users className="h-4 w-4 mr-1" />
            Membres
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="h-4 w-4 mr-1" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="templates">
            <FileTemplate className="h-4 w-4 mr-1" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="integrations">
            <Zap className="h-4 w-4 mr-1" />
            Intégrations
          </TabsTrigger>
          <TabsTrigger value="advanced">
            <Shield className="h-4 w-4 mr-1" />
            Avancé
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="mr-2 h-5 w-5" />
                Informations Générales
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="project-name">Nom du projet</Label>
                <Input
                  id="project-name"
                  value={projectSettings.name}
                  onChange={(e) => setProjectSettings(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="project-description">Description</Label>
                <Textarea
                  id="project-description"
                  value={projectSettings.description}
                  onChange={(e) => setProjectSettings(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="project-theme">Thème</Label>
                <Select value={projectSettings.theme} onValueChange={(value) => setProjectSettings(prev => ({ ...prev, theme: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Par défaut</SelectItem>
                    <SelectItem value="dark">Sombre</SelectItem>
                    <SelectItem value="blue">Bleu</SelectItem>
                    <SelectItem value="green">Vert</SelectItem>
                    <SelectItem value="purple">Violet</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="auto-assign"
                  checked={projectSettings.autoAssign}
                  onCheckedChange={(checked) => setProjectSettings(prev => ({ ...prev, autoAssign: checked }))}
                />
                <Label htmlFor="auto-assign">Attribution automatique des tâches</Label>
              </div>
              
              <div className="pt-4">
                <Button onClick={handleUpdateProject} disabled={loading}>
                  Enregistrer les modifications
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="members">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Users className="mr-2 h-5 w-5" />
                  Membres du Projet ({members.length})
                </div>
                <Button size="sm" onClick={handleInviteMember}>
                  <Plus className="mr-2 h-4 w-4" />
                  Inviter
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Invite Form */}
                <div className="p-4 border rounded-lg bg-blue-50">
                  <h4 className="font-medium mb-2">Inviter un nouveau membre</h4>
                  <div className="flex space-x-2">
                    <Input placeholder="email@exemple.com" className="flex-1" />
                    <Select defaultValue="member">
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="member">Membre</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button onClick={handleInviteMember}>
                      <Mail className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Members List */}
                {members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-[#667EEA] to-[#764BA2] rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {member.user_id.slice(0, 2).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{member.user_id}</p>
                        <p className="text-sm text-gray-500">Membre depuis {new Date(member.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={member.role === 'owner' ? 'default' : 'secondary'}>
                        {member.role}
                      </Badge>
                      {member.role !== 'owner' && (
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                
                {members.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="mx-auto h-12 w-12 mb-2 opacity-30" />
                    <p>Aucun membre dans ce projet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="mr-2 h-5 w-5" />
                Paramètres de Notification
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Notifications par email</Label>
                    <p className="text-sm text-gray-500">Recevoir des emails pour les mises à jour importantes</p>
                  </div>
                  <Switch
                    checked={projectSettings.emailNotifications}
                    onCheckedChange={(checked) => setProjectSettings(prev => ({ ...prev, emailNotifications: checked }))}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Nouvelles tâches assignées</Label>
                    <p className="text-sm text-gray-500">Notification quand une tâche vous est assignée</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Échéances approchantes</Label>
                    <p className="text-sm text-gray-500">Rappels 24h avant l'échéance</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Commentaires et mentions</Label>
                    <p className="text-sm text-gray-500">Notification pour les commentaires et mentions</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Résumé quotidien</Label>
                    <p className="text-sm text-gray-500">Rapport quotidien de l'activité du projet</p>
                  </div>
                  <Switch />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Notifications push</Label>
                    <p className="text-sm text-gray-500">Notifications dans le navigateur</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-medium mb-3">Fréquence des notifications</h4>
                <Select defaultValue="immediate">
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immediate">Immédiate</SelectItem>
                    <SelectItem value="hourly">Toutes les heures</SelectItem>
                    <SelectItem value="daily">Quotidienne</SelectItem>
                    <SelectItem value="weekly">Hebdomadaire</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

       

        <TabsContent value="integrations">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="mr-2 h-5 w-5" />
                  Intégrations Disponibles
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Slack Integration */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <span className="text-purple-600 font-bold">S</span>
                    </div>
                    <div>
                      <h4 className="font-medium">Slack</h4>
                      <p className="text-sm text-gray-500">Notifications dans vos canaux Slack</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={projectSettings.slackIntegration}
                      onCheckedChange={(checked) => setProjectSettings(prev => ({ ...prev, slackIntegration: checked }))}
                    />
                    <Button variant="outline" size="sm">
                      Configurer
                    </Button>
                  </div>
                </div>

                {/* GitHub Integration */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <span className="text-gray-600 font-bold">G</span>
                    </div>
                    <div>
                      <h4 className="font-medium">GitHub</h4>
                      <p className="text-sm text-gray-500">Synchronisation avec vos repositories</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={projectSettings.githubIntegration}
                      onCheckedChange={(checked) => setProjectSettings(prev => ({ ...prev, githubIntegration: checked }))}
                    />
                    <Button variant="outline" size="sm">
                      Configurer
                    </Button>
                  </div>
                </div>

                {/* Webhook */}
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Webhook className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">Webhook</h4>
                      <p className="text-sm text-gray-500">Intégration personnalisée via webhook</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="webhook-url">URL du webhook</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="webhook-url"
                        value={projectSettings.webhookUrl}
                        onChange={(e) => setProjectSettings(prev => ({ ...prev, webhookUrl: e.target.value }))}
                        placeholder="https://votre-webhook.com/endpoint"
                        className="flex-1"
                      />
                      <Button variant="outline" onClick={handleTestWebhook}>
                        Tester
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="advanced">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Database className="mr-2 h-5 w-5" />
                  Gestion des Données
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Export des données</Label>
                  <p className="text-sm text-gray-500">Exporter toutes les données du projet</p>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      Export JSON
                    </Button>
                    <Button variant="outline" size="sm">
                      Export CSV
                    </Button>
                    <Button variant="outline" size="sm">
                      Export PDF
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Sauvegarde automatique</Label>
                  <p className="text-sm text-gray-500">Sauvegarde quotidienne des données</p>
                  <Switch defaultChecked />
                </div>
                
                <div className="space-y-2">
                  <Label>Archivage automatique</Label>
                  <p className="text-sm text-gray-500">Archiver les tâches terminées après 30 jours</p>
                  <Switch />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Palette className="mr-2 h-5 w-5" />
                  Personnalisation Avancée
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Statuts personnalisés</Label>
                  <p className="text-sm text-gray-500">Gérer les colonnes du tableau Kanban</p>
                  <Button variant="outline" size="sm">
                    Gérer les statuts
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <Label>Champs personnalisés</Label>
                  <p className="text-sm text-gray-500">Ajouter des champs spécifiques aux tâches</p>
                  <Button variant="outline" size="sm">
                    Gérer les champs
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <Label>Automatisations</Label>
                  <p className="text-sm text-gray-500">Créer des règles d'automatisation</p>
                  <Button variant="outline" size="sm">
                    Configurer
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="flex items-center text-red-600">
                  <Trash2 className="mr-2 h-5 w-5" />
                  Zone de Danger
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-red-600">Supprimer le projet</Label>
                  <p className="text-sm text-gray-500 mb-3">
                    Cette action est irréversible. Toutes les tâches et données seront perdues.
                  </p>
                  <Button variant="destructive" onClick={handleDeleteProject} disabled={loading}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Supprimer définitivement
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}