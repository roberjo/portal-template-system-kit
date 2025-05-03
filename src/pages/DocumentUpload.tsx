import React, { useState, useRef } from 'react';
import { observer } from 'mobx-react-lite';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/StoreContext';
import { DocumentMetadata } from '../store/types';
import { FileUp, X, ArrowLeft, Tag, Plus, File } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { formatFileSize } from '../utils/formatters';

const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
  'text/csv',
  'application/json',
  'application/zip',
  'application/x-zip-compressed',
  'image/jpeg',
  'image/png',
  'image/gif'
];

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

const DOCUMENT_CATEGORIES = [
  'Finance',
  'HR',
  'Legal',
  'Marketing',
  'Operations',
  'Sales',
  'Technical',
  'Other'
];

const DocumentUpload = observer(() => {
  const navigate = useNavigate();
  const { documentStore } = useStore();
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [metadata, setMetadata] = useState<DocumentMetadata>({
    title: '',
    description: '',
    tags: [],
    category: 'Other',
    customFields: {}
  });
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      validateAndSetFile(event.target.files[0]);
    }
  };
  
  const validateAndSetFile = (file: File) => {
    setError(null);
    
    // Check file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      setError('File type not supported. Please upload a document, spreadsheet, presentation, or image.');
      return;
    }
    
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      setError(`File too large. Maximum size is ${formatFileSize(MAX_FILE_SIZE)}.`);
      return;
    }
    
    setFile(file);
    
    // Auto-populate title from filename (without extension)
    const fileName = file.name.split('.').slice(0, -1).join('.');
    if (!metadata.title) {
      setMetadata({
        ...metadata,
        title: fileName
      });
    }
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };
  
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };
  
  const handleRemoveFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setMetadata({
      ...metadata,
      [name]: value
    });
  };
  
  const handleCategoryChange = (category: string) => {
    setMetadata({
      ...metadata,
      category
    });
  };
  
  const handleAddTag = (e: React.KeyboardEvent | React.MouseEvent) => {
    if (
      (e.type === 'keydown' && (e as React.KeyboardEvent).key !== 'Enter') ||
      !tagInput.trim()
    ) {
      return;
    }
    
    e.preventDefault();
    
    // Add tag if it doesn't already exist
    if (!metadata.tags.includes(tagInput.trim().toLowerCase())) {
      setMetadata({
        ...metadata,
        tags: [...metadata.tags, tagInput.trim().toLowerCase()]
      });
    }
    
    setTagInput('');
  };
  
  const handleRemoveTag = (tagToRemove: string) => {
    setMetadata({
      ...metadata,
      tags: metadata.tags.filter(tag => tag !== tagToRemove)
    });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      setError('Please select a file to upload');
      return;
    }
    
    if (!metadata.title.trim()) {
      setError('Please enter a document title');
      return;
    }
    
    setUploading(true);
    setError(null);
    
    try {
      const document = await documentStore.uploadDocument(file, metadata);
      navigate(`/documents/${document.id}`);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to upload document');
      setUploading(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => navigate('/documents')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Upload Document</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* File Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle>Document File</CardTitle>
          </CardHeader>
          <CardContent>
            {!file ? (
              <div
                className={`border-2 border-dashed rounded-lg p-12 text-center ${
                  dragActive ? 'border-primary bg-primary/5' : 'border-border'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                  ref={fileInputRef}
                  accept={ALLOWED_FILE_TYPES.join(',')}
                />
                <div className="mb-4 flex justify-center">
                  <FileUp className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">
                  Drag & drop your file here
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  or click to browse your files
                </p>
                <Button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Select File
                </Button>
                <p className="text-xs text-muted-foreground mt-4">
                  Supported formats: PDF, Word, Excel, PowerPoint, Images, CSV, ZIP
                  <br />
                  Max file size: {formatFileSize(MAX_FILE_SIZE)}
                </p>
              </div>
            ) : (
              <div className="border rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className="bg-muted rounded-md p-2 mr-3">
                      <File className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-medium text-sm" title={file.name}>
                        {file.name}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(file.size)} • {file.type || 'Unknown type'}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleRemoveFile}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="border-t pt-4">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Change File
                  </Button>
                </div>
              </div>
            )}
            
            {error && (
              <div className="mt-4 p-3 bg-destructive/10 text-destructive text-sm rounded">
                {error}
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Metadata Section */}
        <Card>
          <CardHeader>
            <CardTitle>Document Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  name="title"
                  value={metadata.title}
                  onChange={handleInputChange}
                  placeholder="Enter document title"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={metadata.description}
                  onChange={handleInputChange}
                  placeholder="Enter document description"
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={metadata.category}
                  onValueChange={handleCategoryChange}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {DOCUMENT_CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <div className="flex space-x-2">
                  <div className="relative flex-1">
                    <Tag className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="tags"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddTag(e)}
                      placeholder="Add tags and press Enter"
                      className="pl-8"
                    />
                  </div>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="icon"
                    onClick={handleAddTag}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                
                {metadata.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {metadata.tags.map(tag => (
                      <Badge 
                        key={tag} 
                        variant="secondary"
                        className="flex gap-1 items-center"
                      >
                        <span>{tag}</span>
                        <X 
                          className="h-3 w-3 cursor-pointer" 
                          onClick={() => handleRemoveTag(tag)} 
                        />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </form>
          </CardContent>
          <CardFooter>
            <div className="flex justify-end gap-2 w-full">
              <Button 
                variant="outline" 
                onClick={() => navigate('/documents')}
                disabled={uploading}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={uploading || !file}
              >
                {uploading ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <FileUp className="mr-2 h-4 w-4" />
                    Upload Document
                  </>
                )}
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
});

export default DocumentUpload; 