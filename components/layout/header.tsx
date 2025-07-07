'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { NotificationsCenter } from '@/components/advanced/notifications-center';
import { useAuth } from '@/hooks/use-auth';
import { LogOut, Settings, User, Bell, Search, Command, Zap } from 'lucide-react';
import { toast } from 'sonner';

export function Header() {
  const { user, signOut } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    toast.success('👋 À bientôt !');
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'search':
        setShowSearch(true);
        toast.info('🔍 Recherche rapide (Ctrl+K)');
        break;
      case 'shortcuts':
        toast.info('⌨️ Raccourcis clavier disponibles');
        break;
      default:
        break;
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#667EEA] to-[#764BA2] flex items-center justify-center">
              <span className="text-white font-bold text-sm">T</span>
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-[#667EEA] to-[#764BA2] bg-clip-text text-transparent">
              TaskFlow
            </h1>
          </div>

          {/* Quick Actions */}
          <div className="hidden md:flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => handleQuickAction('search')}
              className="text-gray-600 hover:text-gray-900"
            >
              <Search className="h-4 w-4 mr-1" />
              Rechercher
              <Badge variant="outline" className="ml-2 text-xs">
                Ctrl+K
              </Badge>
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => handleQuickAction('shortcuts')}
              className="text-gray-600 hover:text-gray-900"
            >
              <Command className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Quick Create */}
          <Button 
            size="sm" 
            className="bg-gradient-to-r from-[#667EEA] to-[#764BA2] hover:from-[#5A67D8] hover:to-[#6B46C1]"
          >
            <Zap className="h-4 w-4 mr-1" />
            Créer
          </Button>

          {/* Notifications */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative"
            >
              <Bell className="h-4 w-4" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 bg-red-500 text-white text-xs">
                3
              </Badge>
            </Button>
            
            {showNotifications && (
              <div className="absolute right-0 top-full mt-2 z-50">
                <NotificationsCenter />
              </div>
            )}
          </div>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-gradient-to-br from-[#667EEA] to-[#764BA2] text-white">
                    {user?.email?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <div className="flex items-center justify-start gap-2 p-2">
                <div className="flex flex-col space-y-1 leading-none">
                  <p className="font-medium">{user?.email}</p>
                  <p className="text-xs text-gray-500">Membre depuis janvier 2024</p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                Mon Profil
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Préférences
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Command className="mr-2 h-4 w-4" />
                Raccourcis clavier
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                Déconnexion
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Click outside to close notifications */}
      {showNotifications && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowNotifications(false)}
        />
      )}
    </header>
  );
}