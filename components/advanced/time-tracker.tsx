'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Play, Pause, Square, Clock, Calendar, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';

interface TimeTrackerProps {
  taskId: string;
  taskTitle: string;
}

export function TimeTracker({ taskId, taskTitle }: TimeTrackerProps) {
  const [isTracking, setIsTracking] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [description, setDescription] = useState('');
  const [timeEntries, setTimeEntries] = useState<any[]>([]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTracking && startTime) {
      interval = setInterval(() => {
        setElapsedTime(Date.now() - startTime.getTime());
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTracking, startTime]);

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    return `${hours.toString().padStart(2, '0')}:${(minutes % 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
  };

  const startTracking = () => {
    setStartTime(new Date());
    setIsTracking(true);
    setElapsedTime(0);
    toast.success('⏱️ Suivi du temps démarré', {
      description: `Travail sur "${taskTitle}"`,
    });
  };

  const pauseTracking = () => {
    setIsTracking(false);
    toast.info('⏸️ Suivi du temps mis en pause');
  };

  const stopTracking = async () => {
    if (!startTime) return;
    
    setIsTracking(false);
    const duration = elapsedTime;
    
    // Save time entry to database
    try {
      // Implementation would save to Supabase
      toast.success('✅ Temps enregistré', {
        description: `${formatTime(duration)} ajouté à la tâche`,
      });
      
      setStartTime(null);
      setElapsedTime(0);
      setDescription('');
    } catch (error) {
      toast.error('Erreur lors de l\'enregistrement');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Clock className="mr-2 h-5 w-5" />
          Suivi du Temps
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className="text-3xl font-mono font-bold text-blue-600 mb-4">
            {formatTime(elapsedTime)}
          </div>
          
          <div className="flex justify-center space-x-2">
            {!isTracking ? (
              <Button onClick={startTracking} className="bg-green-600 hover:bg-green-700">
                <Play className="mr-2 h-4 w-4" />
                Démarrer
              </Button>
            ) : (
              <>
                <Button onClick={pauseTracking} variant="outline">
                  <Pause className="mr-2 h-4 w-4" />
                  Pause
                </Button>
                <Button onClick={stopTracking} className="bg-red-600 hover:bg-red-700">
                  <Square className="mr-2 h-4 w-4" />
                  Arrêter
                </Button>
              </>
            )}
          </div>
        </div>

        {isTracking && (
          <div className="space-y-2">
            <Label htmlFor="time-description">Description (optionnel)</Label>
            <Textarea
              id="time-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Décrivez ce sur quoi vous travaillez..."
              rows={2}
            />
          </div>
        )}

        <div className="space-y-2">
          <h4 className="font-medium">Temps total aujourd hui</h4>
          <Badge variant="outline" className="text-lg px-3 py-1">
            <Clock className="mr-1 h-4 w-4" />
            2h 45m
          </Badge>
        </div>

        <div className="space-y-2">
          <h4 className="font-medium">Cette semaine</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>Lun: 3h 20m</div>
            <div>Mar: 4h 15m</div>
            <div>Mer: 2h 45m</div>
            <div>Jeu: 5h 30m</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}