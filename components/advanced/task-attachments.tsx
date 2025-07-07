'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Paperclip, Upload, Download, Eye, Trash2, File, Image, FileText } from 'lucide-react';
import { toast } from 'sonner';

interface Attachment {
  id: string;
  name: string;
  size: string;
  type: string;
  url: string;
  uploadedBy: string;
  uploadedAt: string;
}

interface TaskAttachmentsProps {
  taskId: string;
}

export function TaskAttachments({ taskId }: TaskAttachmentsProps) {
  const [attachments, setAttachments] = useState<Attachment[]>([
    {
      id: '1',
      name: 'design-mockup.figma',
      size: '2.3 MB',
      type: 'figma',
      url: '#',
      uploadedBy: 'Marie Martin',
      uploadedAt: '2024-01-15T10:30:00Z'
    },
    {
      id: '2',
      name: 'requirements.pdf',
      size: '856 KB',
      type: 'pdf',
      url: '#',
      uploadedBy: 'John Doe',
      uploadedAt: '2024-01-14T16:20:00Z'
    },
    {
      id: '3',
      name: 'screenshot.png',
      size: '1.2 MB',
      type: 'image',
      url: '#',
      uploadedBy: 'Vous',
      uploadedAt: '2024-01-13T09:15:00Z'
    }
  ]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getFileIcon = (type: string) => {
    {/* eslint-disable-next-line jsx-a11y/alt-text */}
    if (type.includes('image')) return <Image className="h-4 w-4"/>;
    if (type.includes('pdf') || type.includes('doc')) return <FileText className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };

  const getFileTypeColor = (type: string) => {
    if (type.includes('image')) return 'bg-green-100 text-green-800';
    if (type.includes('pdf')) return 'bg-red-100 text-red-800';
    if (type.includes('doc')) return 'bg-blue-100 text-blue-800';
    if (type.includes('figma')) return 'bg-purple-100 text-purple-800';
    return 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
  };

  const handleFiles = (files: File[]) => {
    files.forEach(file => {
      const newAttachment: Attachment = {
        id: Date.now().toString() + Math.random(),
        name: file.name,
        size: formatFileSize(file.size),
        type: file.type,
        url: URL.createObjectURL(file),
        uploadedBy: 'Vous',
        uploadedAt: new Date().toISOString()
      };
      
      setAttachments(prev => [...prev, newAttachment]);
      toast.success('📎 Fichier ajouté', {
        description: file.name
      });
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const deleteAttachment = (id: string) => {
    const attachment = attachments.find(a => a.id === id);
    setAttachments(attachments.filter(a => a.id !== id));
    toast.success('🗑️ Fichier supprimé', {
      description: attachment?.name
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Paperclip className="mr-2 h-5 w-5" />
            Pièces jointes ({attachments.length})
          </div>
          <Button onClick={handleFileSelect} size="sm" variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            Ajouter
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload Zone */}
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            isDragging 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleFileSelect}
        >
          <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
          <p className="text-sm text-gray-600">
            Glissez vos fichiers ici ou <span className="text-blue-600 cursor-pointer">cliquez pour parcourir</span>
          </p>
          <p className="text-xs text-gray-500 mt-1">
            PNG, JPG, PDF, DOC, FIGMA jusqu à 10MB
          </p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleFileChange}
          accept="image/*,.pdf,.doc,.docx,.figma"
        />

        {/* Attachments List */}
        <div className="space-y-2">
          {attachments.map((attachment) => (
            <div key={attachment.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 group">
              <div className="flex-shrink-0">
                {getFileIcon(attachment.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {attachment.name}
                  </p>
                  <Badge className={`text-xs ${getFileTypeColor(attachment.type)}`}>
                    {attachment.type.split('/')[1]?.toUpperCase() || 'FILE'}
                  </Badge>
                </div>
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <span>{attachment.size}</span>
                  <span>Par {attachment.uploadedBy}</span>
                  <span>{formatDate(attachment.uploadedAt)}</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Eye className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Download className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                  onClick={() => deleteAttachment(attachment.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {attachments.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Paperclip className="mx-auto h-12 w-12 mb-2 opacity-30" />
            <p className="text-sm">Aucune pièce jointe</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}