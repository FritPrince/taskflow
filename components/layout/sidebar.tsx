'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, FolderOpen, Calendar, BarChart3, Settings, AlertCircle } from 'lucide-react';
import { supabase, type Project } from '@/lib/supabase';
import { useAuth } from '@/hooks/use-auth';
import { CreateProjectDialog } from '@/components/projects/create-project-dialog';

interface SidebarProps {
  selectedProject: Project | null;
  onSelectProject: (project: Project) => void;
  activeView: string;
  onViewChange: (view: string) => void;
}

export function Sidebar({ selectedProject, onSelectProject, activeView, onViewChange }: SidebarProps) {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      fetchProjects();
    }
  }, [user]);// eslint-disable-line react-hooks/exhaustive-deps

  const fetchProjects = async () => {
    if (!user) return;
    
    setLoading(true);
    setError('');
    
    try {
      console.log('Fetching projects for user:', user.id);
      
      const { data, error: fetchError } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('Fetch error:', fetchError);
        throw fetchError;
      }

      console.log('Projects fetched:', data);
      setProjects(data || []);
    } catch (error: any) {
      console.error('Error fetching projects:', error);
      setError('Erreur lors du chargement des projets');
    } finally {
      setLoading(false);
    }
  };

  const handleProjectCreated = (project: Project) => {
    console.log('Project created, updating list:', project);
    setProjects([project, ...projects]);
    onSelectProject(project);
    setShowCreateDialog(false);
  };

  const navItems = [
    { id: 'kanban', icon: FolderOpen, label: 'Kanban', active: activeView === 'kanban' },
    { id: 'calendar', icon: Calendar, label: 'Calendrier', active: activeView === 'calendar' },
    { id: 'reports', icon: BarChart3, label: 'Rapports', active: activeView === 'reports' },
    { id: 'settings', icon: Settings, label: 'Paramètres', active: activeView === 'settings' },
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-full flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <Button 
          onClick={() => setShowCreateDialog(true)}
          className="w-full bg-gradient-to-r from-[#667EEA] to-[#764BA2] hover:from-[#5A67D8] hover:to-[#6B46C1]"
        >
          <Plus className="mr-2 h-4 w-4" />
          Nouveau projet
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <nav className="p-4">
          <div className="space-y-2">
            {navItems.map((item) => (
              <Button
                key={item.id}
                variant={item.active ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => onViewChange(item.id)}
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.label}
              </Button>
            ))}
          </div>
        </nav>

        <div className="p-4">
          <h3 className="text-sm font-medium text-gray-600 mb-3">Mes projets</h3>
          
          {error && (
            <div className="flex items-center p-2 bg-red-50 border border-red-200 rounded-md mb-3">
              <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
              <span className="text-red-800 text-xs">{error}</span>
            </div>
          )}
          
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {projects.map((project) => (
                <Card
                  key={project.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedProject?.id === project.id
                      ? 'ring-2 ring-[#667EEA] bg-blue-50'
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => onSelectProject(project)}
                >
                  <CardHeader className="p-3">
                    <CardTitle className="text-sm font-medium truncate">
                      {project.name}
                    </CardTitle>
                    {project.description && (
                      <p className="text-xs text-gray-500 truncate">
                        {project.description}
                      </p>
                    )}
                  </CardHeader>
                </Card>
              ))}
              {projects.length === 0 && !error && (
                <div className="text-center py-8 text-gray-500">
                  <FolderOpen className="mx-auto h-12 w-12 mb-2 opacity-30" />
                  <p className="text-sm">Aucun projet encore</p>
                  <p className="text-xs mt-1">Créez votre premier projet !</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <CreateProjectDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onProjectCreated={handleProjectCreated}
      />
    </div>
  );
}