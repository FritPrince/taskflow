'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase, type Task, type Project, type TaskStatus } from '@/lib/supabase';
import { BarChart3, TrendingUp, Clock, Users, Target, Calendar } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

interface ReportsViewProps {
  selectedProject: Project | null;
}

export function ReportsView({ selectedProject }: ReportsViewProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [statuses, setStatuses] = useState<TaskStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState({
    totalTasks: 0,
    completedTasks: 0,
    overdueTasks: 0,
    avgCompletionTime: 0,
    productivityScore: 0,
  });

  useEffect(() => {
    if (selectedProject) {
      fetchData();
    }
  }, [selectedProject]);// eslint-disable-line react-hooks/exhaustive-deps

  const fetchData = async () => {
    if (!selectedProject) return;

    try {
      const [tasksResponse, statusesResponse] = await Promise.all([
        supabase
          .from('tasks')
          .select('*')
          .eq('project_id', selectedProject.id),
        supabase
          .from('task_statuses')
          .select('*')
          .eq('project_id', selectedProject.id)
          .order('order_index'),
      ]);

      if (tasksResponse.error) throw tasksResponse.error;
      if (statusesResponse.error) throw statusesResponse.error;

      const tasksData = tasksResponse.data || [];
      const statusesData = statusesResponse.data || [];

      setTasks(tasksData);
      setStatuses(statusesData);

      // Calculate analytics
      const completedStatus = statusesData.find(s => s.name.toLowerCase().includes('terminé') || s.name.toLowerCase().includes('done'));
      const completedTasks = completedStatus ? tasksData.filter(t => t.status_id === completedStatus.id).length : 0;
      const overdueTasks = tasksData.filter(t => t.due_date && new Date(t.due_date) < new Date()).length;
      const productivityScore = tasksData.length > 0 ? Math.round((completedTasks / tasksData.length) * 100) : 0;

      setAnalytics({
        totalTasks: tasksData.length,
        completedTasks,
        overdueTasks,
        avgCompletionTime: 3.2, // Mock data
        productivityScore,
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityData = () => {
    const priorities = ['low', 'medium', 'high', 'urgent'];
    return priorities.map(priority => ({
      name: priority,
      value: tasks.filter(t => t.priority === priority).length,
      color: priority === 'urgent' ? '#EF4444' : 
             priority === 'high' ? '#F97316' :
             priority === 'medium' ? '#EAB308' : '#22C55E'
    }));
  };

  const getStatusData = () => {
    return statuses.map(status => ({
      name: status.name,
      value: tasks.filter(t => t.status_id === status.id).length,
      color: status.color,
    }));
  };

  const getWeeklyProgress = () => {
    // Mock weekly data - in real app, this would come from database
    return [
      { week: 'S1', completed: 12, created: 15 },
      { week: 'S2', completed: 18, created: 20 },
      { week: 'S3', completed: 25, created: 22 },
      { week: 'S4', completed: 30, created: 28 },
    ];
  };

  if (!selectedProject) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <BarChart3 className="mx-auto h-24 w-24 text-gray-300 mb-4" />
          <h2 className="text-2xl font-semibold text-gray-600 mb-2">
            Rapports et Analyses
          </h2>
          <p className="text-gray-500">
            Sélectionnez un projet pour voir les statistiques détaillées
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-64"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-100 rounded"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <div key={i} className="h-80 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Rapports - {selectedProject.name}
        </h1>
        <p className="text-gray-600">
          Analyses et métriques de performance du projet
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tâches</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalTasks}</div>
            <p className="text-xs text-muted-foreground">
              +12% par rapport au mois dernier
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tâches Terminées</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{analytics.completedTasks}</div>
            <p className="text-xs text-muted-foreground">
              {analytics.totalTasks > 0 ? Math.round((analytics.completedTasks / analytics.totalTasks) * 100) : 0}% du total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Retard</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{analytics.overdueTasks}</div>
            <p className="text-xs text-muted-foreground">
              Nécessitent une attention immédiate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Score Productivité</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.productivityScore}%</div>
            <Progress value={analytics.productivityScore} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Répartition par Priorité</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={getPriorityData()}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {getPriorityData().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Répartition par Statut</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={getStatusData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#667EEA" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Progression Hebdomadaire</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={getWeeklyProgress()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="completed" stroke="#22C55E" strokeWidth={2} />
                <Line type="monotone" dataKey="created" stroke="#667EEA" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Résumé des Performances</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Taux de completion</span>
              <Badge variant="secondary">{analytics.productivityScore}%</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Temps moyen de completion</span>
              <Badge variant="secondary">{analytics.avgCompletionTime} jours</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Tâches créées ce mois</span>
              <Badge variant="secondary">{analytics.totalTasks}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Efficacité équipe</span>
              <Badge variant="secondary" className="bg-green-100 text-green-800">Excellente</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}