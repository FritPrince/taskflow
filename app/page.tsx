'use client';

import { useState } from 'react';
import { AuthForm } from '@/components/auth/auth-form';
import { Header } from '@/components/layout/header';
import { Sidebar } from '@/components/layout/sidebar';
import { KanbanBoard } from '@/components/kanban/kanban-board';
import { CalendarView } from '@/components/calendar/calendar-view';
import { ReportsView } from '@/components/reports/reports-view';
import { SettingsView } from '@/components/settings/settings-view';
import { useAuth } from '@/hooks/use-auth';
import { type Project } from '@/lib/supabase';
import { FolderOpen } from 'lucide-react';

export default function Home() {
  const { user, loading } = useAuth();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [activeView, setActiveView] = useState('kanban');

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#667EEA] to-[#764BA2] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthForm />;
  }

  const renderMainContent = () => {
    if (!selectedProject && activeView !== 'kanban') {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <FolderOpen className="mx-auto h-24 w-24 text-gray-300 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-600 mb-2">
              Sélectionnez un projet
            </h2>
            <p className="text-gray-500">
              Choisissez un projet dans la barre latérale pour accéder à cette vue
            </p>
          </div>
        </div>
      );
    }

    switch (activeView) {
      case 'calendar':
        return <CalendarView selectedProject={selectedProject} />;
      case 'reports':
        return <ReportsView selectedProject={selectedProject} />;
      case 'settings':
        return <SettingsView selectedProject={selectedProject} />;
      default:
        return selectedProject ? (
          <KanbanBoard project={selectedProject} />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <FolderOpen className="mx-auto h-24 w-24 text-gray-300 mb-4" />
              <h2 className="text-2xl font-semibold text-gray-600 mb-2">
                Bienvenue sur TaskFlow
              </h2>
              <p className="text-gray-500 mb-6">
                Sélectionnez un projet dans la barre latérale pour commencer
              </p>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 max-w-md mx-auto">
                <h3 className="font-semibold text-gray-800 mb-2">Fonctionnalités</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Gestion de projets et tâches</li>
                  <li>• Interface Kanban drag & drop</li>
                  <li>• Vue calendrier et rapports</li>
                  <li>• Priorisation et deadlines</li>
                  <li>• Collaboration en temps réel</li>
                </ul>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex h-[calc(100vh-4rem)]">
        <Sidebar
          selectedProject={selectedProject}
          onSelectProject={setSelectedProject}
          activeView={activeView}
          onViewChange={setActiveView}
        />
        
        <main className="flex-1 overflow-hidden">
          {renderMainContent()}
        </main>
      </div>
    </div>
  );
}