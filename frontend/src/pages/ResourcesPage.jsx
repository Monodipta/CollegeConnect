import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, UploadIcon, FileTextIcon, DownloadIcon, Trash2Icon, SearchIcon, FilterIcon, FileIcon, ImageIcon, FileSpreadsheetIcon, FileWarningIcon, FileQuestionIcon } from 'lucide-react'; // Added more specific file icons

import useAuthStore from '@/store/authStore';
import resourceService from '@/services/resourceService';
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";

const ResourcesPage = () => {
  const { user: collegeUser, logout, setError } = useAuthStore();
  const navigate = useNavigate();
  const { toast } = useToast();

  // State for Upload Form
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(''); // Category for upload form
  const [resourceFile, setResourceFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  // State for Resource List
  const [resources, setResources] = useState([]);
  const [isLoadingResources, setIsLoadingResources] = useState(true);
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const resourceCategories = [
    'Official Documents',
    'Event Materials',
    'Reports & Academic Content',
    'Administrative Documents',
  ];

  // Helper to determine icon based on file extension
  const getFileIcon = (filePath) => {
    const extension = filePath.split('.').pop().toLowerCase();
    switch (extension) {
      case 'pdf': return <FileTextIcon className="h-5 w-5 text-red-500" />;
      case 'doc':
      case 'docx': return <FileTextIcon className="h-5 w-5 text-blue-500" />; // Assuming FileText for docs
      case 'xls':
      case 'xlsx': return <FileSpreadsheetIcon className="h-5 w-5 text-green-500" />;
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'gif':
      case 'bmp': return <ImageIcon className="h-5 w-5 text-purple-500" />;
      default: return <FileIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  // Helper to check if file is viewable directly in browser (for thumbnail/direct view)
  const isImageViewable = (filePath) => {
    const extension = filePath.split('.').pop().toLowerCase();
    return ['png', 'jpg', 'jpeg', 'gif', 'bmp'].includes(extension);
  };

  const getFileThumbnailOrIcon = (resource) => {
    const fullUrl = `${import.meta.env.VITE_BACKEND_URL.replace('/api', '')}${resource.file}`;
     console.log('Thumbnail/Icon URL being generated:', fullUrl);
    if (isImageViewable(resource.file)) {
      return (
        <img
          src={fullUrl}
          alt={resource.originalFileName}
          className="w-16 h-16 object-cover rounded-md border border-gray-200 dark:border-gray-600 mr-3"
        />
      );
    }
    return <div className="w-16 h-16 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-md mr-3 border border-gray-200 dark:border-gray-600">{getFileIcon(resource.file)}</div>;
  };

  useEffect(() => {
    if (!collegeUser) {
      navigate('/login');
      return;
    }
    fetchResources();
  }, [collegeUser, navigate, logout, setError, toast]);

  const fetchResources = async () => {
    setIsLoadingResources(true);
    try {
      const data = await resourceService.getResources();
      setResources(data);
    } catch (err) {
      console.error('Failed to fetch resources:', err);
      const message = err.response && err.response.data && err.response.data.message
        ? err.response.data.message
        : err.message;
      setError(message);
      toast({
        title: "Error Loading Resources",
        description: message,
        variant: "destructive",
      });
      if (err.response && err.response.status === 401) {
        logout();
        navigate('/login');
      }
    } finally {
      setIsLoadingResources(false);
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();

    if (!resourceFile || !title || !description || !category) {
      toast({
        title: "Missing Fields",
        description: "Please fill all required fields and select a file.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('category', category);
    formData.append('resourceFile', resourceFile);

    try {
      await resourceService.uploadResource(formData);
      toast({
        title: "Resource Uploaded",
        description: "Your file has been successfully shared.",
      });
      setTitle('');
      setDescription('');
      setCategory('');
      setResourceFile(null);
      const fileInput = document.getElementById('resourceFile');
      if (fileInput) fileInput.value = '';
      fetchResources();
    } catch (err) {
      console.error('Failed to upload resource:', err);
      const message = err.response && err.response.data && err.response.data.message
        ? err.response.data.message
        : err.message;
      setError(message);
      toast({
        title: "Upload Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteResource = async (resourceId, resourceTitle) => {
    if (!window.confirm(`Are you sure you want to delete "${resourceTitle}"?`)) {
      return;
    }
    try {
      await resourceService.deleteResource(resourceId);
      toast({
        title: "Resource Deleted",
        description: `"${resourceTitle}" has been removed.`,
      });
      fetchResources();
    } catch (err) {
      console.error('Failed to delete resource:', err);
      const message = err.response && err.response.data && err.response.data.message
        ? err.response.data.message
        : err.message;
      setError(message);
      toast({
        title: "Deletion Error",
        description: message,
        variant: "destructive",
      });
    }
  };

  // NEW: handleViewResource to open in new tab
  const handleViewResource = (resource) => {
    const fullUrl = `${import.meta.env.VITE_BACKEND_URL.replace('/api', '')}${resource.file}`;
     console.log('Attempting to VIEW URL:', fullUrl); // ADD THIS LINE
    window.open(fullUrl, '_blank'); // Opens the file directly in a new tab
  };

  // handleDownloadResource now forces download
  const handleDownloadResource = async (resourceId, originalFileName) => {
    try {
      const response = await resourceService.downloadResource(resourceId);
      const blob = response.data;

      // Ensure filename has an extension for proper download
      let filenameToUse = originalFileName || 'downloaded_file';
      if (!filenameToUse.includes('.')) {
        // Fallback: Try to get extension from actual file path stored in DB
        const storedExtension = resourceId && resources.find(r => r._id === resourceId)?.file?.split('.').pop();
        if (storedExtension) {
          filenameToUse += `.${storedExtension}`;
        }
      }

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filenameToUse);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Download Initiated",
        description: `"${filenameToUse}" is downloading...`,
      });

    } catch (err) {
      console.error('Failed to download resource:', err);
      const message = err.response?.data?.message || err.message;
      toast({
        title: "Download Error",
        description: message,
        variant: "destructive",
      });
    }
  };

  const filteredResources = resources.filter(resource => {
    const matchesCategory = filterCategory === 'all' ? true : resource.category === filterCategory;
    const matchesSearch = searchTerm
      ? resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.uploadedBy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.originalFileName.toLowerCase().includes(searchTerm.toLowerCase()) // Search by original filename
      : true;
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="container mx-auto py-8 px-4 md:px-6 lg:px-8">
      <h1 className="text-4xl font-extrabold text-gray-800 dark:text-gray-100 mb-8 text-center">
        Shared Resources <span className="text-blue-600 dark:text-blue-400">Library</span>
      </h1>

      {/* Upload New Resource Section */}
      <Card className="mb-8 shadow-lg border border-gray-100 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <UploadIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" /> Upload New Resource
          </CardTitle>
          <CardDescription>Share documents, reports, or materials with other colleges.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUploadSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory} required>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {resourceCategories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2 col-span-full">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" placeholder="Briefly describe the resource..." value={description} onChange={(e) => setDescription(e.target.value)} required rows={3} />
            </div>
            <div className="grid gap-2 col-span-full">
              <Label htmlFor="resourceFile">Upload File</Label>
              <Input id="resourceFile" type="file" onChange={(e) => setResourceFile(e.target.files[0])} required />
              {resourceFile && <p className="text-sm text-gray-500">Selected: {resourceFile.name}</p>}
            </div>
            <div className="col-span-full flex justify-end">
              <Button type="submit" disabled={isUploading} className="px-6 py-2">
                {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UploadIcon className="mr-2 h-4 w-4" />}
                {isUploading ? 'Uploading...' : 'Upload Resource'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Resources List Section */}
      <Card className="shadow-lg border border-gray-100 dark:border-gray-700">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div>
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <FileTextIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" /> All Shared Resources
            </CardTitle>
            <CardDescription>Browse and download documents shared by colleges across the network.</CardDescription>
          </div>
          {/* Filters & Search */}
          <div className="flex items-center space-x-2">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search resources..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-3 w-48"
              />
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-[180px]">
                <FilterIcon className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {resourceCategories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => { setSearchTerm(''); setFilterCategory('all'); }}>
              Reset Filters
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingResources ? (
            <div className="flex justify-center items-center h-48">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
              <p className="ml-2 text-lg text-gray-600 dark:text-gray-300">Loading resources...</p>
            </div>
          ) : filteredResources.length === 0 ? (
            <div className="text-center py-10 text-gray-500 dark:text-gray-400">
              <p className="text-lg">No resources found matching your criteria.</p>
              <p className="text-sm mt-2">Try uploading one or adjusting your filters!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredResources.map(resource => (
                <Card key={resource._id} className="shadow-md hover:shadow-lg transition-shadow duration-200 flex flex-col justify-between border border-gray-200 dark:border-gray-700">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-semibold truncate">{resource.title}</CardTitle>
                    <CardDescription className="text-sm text-muted-foreground">
                      Category: {resource.category}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 text-sm text-gray-700 dark:text-gray-300 pb-3">
                    <div className="flex items-center mb-2 cursor-pointer" onClick={() => handleViewResource(resource)}>
                      {getFileThumbnailOrIcon(resource)} {/* File icon/thumbnail */}
                      <span className="font-medium text-blue-600 dark:text-blue-400 hover:underline">
                        {resource.originalFileName}
                      </span>
                    </div>
                    <p className="line-clamp-3">{resource.description}</p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Uploaded by: {resource.uploadedBy?.name || 'Unknown'} on {new Date(resource.createdAt).toLocaleDateString()}
                    </p>
                  </CardContent>
                  <div className="p-4 border-t flex justify-between items-center bg-muted/20">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownloadResource(resource._id, resource.originalFileName)} // Pass originalFileName
                      className="flex items-center gap-1 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      <DownloadIcon className="h-4 w-4" /> Download
                    </Button>
                    {resource.uploadedBy?._id === collegeUser?._id && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteResource(resource._id, resource.title)}
                        className="flex items-center gap-1"
                      >
                        <Trash2Icon className="h-4 w-4" /> Delete
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      <Toaster />
    </div>
  );
};

export default ResourcesPage;