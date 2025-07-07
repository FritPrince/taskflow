'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Send, Paperclip, Smile, AtSign, Heart, Reply } from 'lucide-react';
import { toast } from 'sonner';

interface TaskCommentsProps {
  taskId: string;
}

export function TaskComments({ taskId }: TaskCommentsProps) {
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState([
    {
      id: '1',
      user: 'John Doe',
      content: 'Cette tâche nécessite une attention particulière sur la partie responsive. J\'ai ajouté quelques notes dans le design.',
      timestamp: '2024-01-15T10:30:00Z',
      mentions: ['@marie'],
      reactions: [{ emoji: '👍', count: 2 }, { emoji: '❤️', count: 1 }],
      attachments: []
    },
    {
      id: '2',
      user: 'Marie Martin',
      content: '@john Merci pour les notes ! J\'ai commencé l\'implémentation. Le design mobile est presque terminé.',
      timestamp: '2024-01-15T14:20:00Z',
      mentions: ['@john'],
      reactions: [{ emoji: '🚀', count: 1 }],
      attachments: [
        { name: 'mobile-design.png', size: '2.3 MB', type: 'image' }
      ]
    }
  ]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      // Implementation would save to Supabase
      const comment = {
        id: Date.now().toString(),
        user: 'Vous',
        content: newComment,
        timestamp: new Date().toISOString(),
        mentions: [],
        reactions: [],
        attachments: []
      };

      setComments([...comments, comment]);
      setNewComment('');
      
      toast.success('💬 Commentaire ajouté');
    } catch (error) {
      toast.error('Erreur lors de l\'ajout du commentaire');
    }
  };

  const addReaction = (commentId: string, emoji: string) => {
    setComments(comments.map(comment => {
      if (comment.id === commentId) {
        const existingReaction = comment.reactions.find(r => r.emoji === emoji);
        if (existingReaction) {
          existingReaction.count++;
        } else {
          comment.reactions.push({ emoji, count: 1 });
        }
      }
      return comment;
    }));
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <MessageSquare className="mr-2 h-5 w-5" />
          Commentaires ({comments.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Comments List */}
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {comments.map((comment) => (
            <div key={comment.id} className="flex space-x-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-gradient-to-br from-[#667EEA] to-[#764BA2] text-white text-xs">
                  {comment.user.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 space-y-2">
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm">{comment.user}</span>
                    <span className="text-xs text-gray-500">{formatTimestamp(comment.timestamp)}</span>
                  </div>
                  
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {comment.content}
                  </p>
                  
                  {comment.attachments.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {comment.attachments.map((attachment, index) => (
                        <div key={index} className="flex items-center space-x-2 text-xs text-blue-600">
                          <Paperclip className="h-3 w-3" />
                          <span>{attachment.name}</span>
                          <span className="text-gray-500">({attachment.size})</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Reactions */}
                <div className="flex items-center space-x-2">
                  {comment.reactions.map((reaction, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs"
                      onClick={() => addReaction(comment.id, reaction.emoji)}
                    >
                      {reaction.emoji} {reaction.count}
                    </Button>
                  ))}
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2"
                    onClick={() => addReaction(comment.id, '👍')}
                  >
                    <Heart className="h-3 w-3" />
                  </Button>
                  
                  <Button variant="ghost" size="sm" className="h-6 px-2">
                    <Reply className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* New Comment Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative">
            <Textarea
              ref={textareaRef}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Ajouter un commentaire... (utilisez @ pour mentionner)"
              rows={3}
              className="resize-none"
            />
            
            <div className="absolute bottom-2 right-2 flex space-x-1">
              <Button type="button" variant="ghost" size="sm" className="h-6 w-6 p-0">
                <Paperclip className="h-3 w-3" />
              </Button>
              <Button type="button" variant="ghost" size="sm" className="h-6 w-6 p-0">
                <Smile className="h-3 w-3" />
              </Button>
              <Button type="button" variant="ghost" size="sm" className="h-6 w-6 p-0">
                <AtSign className="h-3 w-3" />
              </Button>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="text-xs text-gray-500">
              Markdown supporté • @ pour mentionner • Glissez des fichiers
            </div>
            <Button type="submit" size="sm" disabled={!newComment.trim()}>
              <Send className="mr-1 h-3 w-3" />
              Envoyer
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}