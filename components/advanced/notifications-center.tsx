'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Bell, 
  BellRing, 
  Check, 
  CheckCheck, 
  Clock, 
  MessageSquare, 
  UserPlus, 
  AlertTriangle,
  Calendar,
  Target
} from 'lucide-react';
import { toast } from 'sonner';

interface Notification {
  id: string;
  type: 'task_assigned' | 'task_completed' | 'deadline_approaching' | 'mention' | 'comment' | 'project_invite';
  title: string;
  message: string;
  read: boolean;
  timestamp: string;
  data?: any;
}

export function NotificationsCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'task_assigned',
      title: 'Nouvelle tâche assignée',
      message: 'Marie vous a assigné "Créer la page d\'accueil"',
      read: false,
      timestamp: '2024-01-15T10:30:00Z',
      data: { taskId: 'task-1', projectId: 'proj-1' }
    },
    {
      id: '2',
      type: 'deadline_approaching',
      title: 'Échéance proche',
      message: '"Intégration API" doit être terminée dans 2 heures',
      read: false,
      timestamp: '2024-01-15T08:00:00Z',
      data: { taskId: 'task-2' }
    },
    {
      id: '3',
      type: 'mention',
      title: 'Vous avez été mentionné',
      message: 'John vous a mentionné dans un commentaire',
      read: true,
      timestamp: '2024-01-14T16:45:00Z',
      data: { taskId: 'task-3', commentId: 'comment-1' }
    },
    {
      id: '4',
      type: 'task_completed',
      title: 'Tâche terminée',
      message: 'Sarah a terminé "Tests unitaires"',
      read: true,
      timestamp: '2024-01-14T14:20:00Z',
      data: { taskId: 'task-4' }
    },
    {
      id: '5',
      type: 'project_invite',
      title: 'Invitation au projet',
      message: 'Vous avez été invité au projet "E-commerce Mobile"',
      read: false,
      timestamp: '2024-01-14T09:15:00Z',
      data: { projectId: 'proj-2' }
    }
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'task_assigned': return <Target className="h-4 w-4 text-blue-600" />;
      case 'task_completed': return <Check className="h-4 w-4 text-green-600" />;
      case 'deadline_approaching': return <Clock className="h-4 w-4 text-orange-600" />;
      case 'mention': return <MessageSquare className="h-4 w-4 text-purple-600" />;
      case 'comment': return <MessageSquare className="h-4 w-4 text-blue-600" />;
      case 'project_invite': return <UserPlus className="h-4 w-4 text-green-600" />;
      default: return <Bell className="h-4 w-4 text-gray-600" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'task_assigned': return 'bg-blue-50 border-blue-200';
      case 'task_completed': return 'bg-green-50 border-green-200';
      case 'deadline_approaching': return 'bg-orange-50 border-orange-200';
      case 'mention': return 'bg-purple-50 border-purple-200';
      case 'comment': return 'bg-blue-50 border-blue-200';
      case 'project_invite': return 'bg-green-50 border-green-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins}m`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    return `Il y a ${diffDays}j`;
  };

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
    toast.success('✅ Toutes les notifications marquées comme lues');
  };

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id));
    toast.success('🗑️ Notification supprimée');
  };

  return (
    <Card className="w-80">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <BellRing className="mr-2 h-5 w-5" />
            Notifications
            {unreadCount > 0 && (
              <Badge className="ml-2 bg-red-500 text-white">
                {unreadCount}
              </Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead}>
              <CheckCheck className="h-4 w-4" />
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-96">
          <div className="space-y-1 p-4">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-3 rounded-lg border cursor-pointer transition-colors hover:bg-gray-50 ${
                  !notification.read 
                    ? getNotificationColor(notification.type)
                    : 'bg-white border-gray-200'
                }`}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className={`text-sm font-medium ${
                        !notification.read ? 'text-gray-900' : 'text-gray-600'
                      }`}>
                        {notification.title}
                      </p>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"></div>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-600 mt-1">
                      {notification.message}
                    </p>
                    
                    <p className="text-xs text-gray-500 mt-2">
                      {formatTimestamp(notification.timestamp)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {notifications.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Bell className="mx-auto h-12 w-12 mb-2 opacity-30" />
            <p className="text-sm">Aucune notification</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}