import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, ArchiveIcon, Trash2Icon, DownloadIcon, EyeIcon, SearchIcon, ArrowLeftIcon } from 'lucide-react';

import useAuthStore from '@/store/authStore';
import resourceService from '@/services/resourceService';
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"; // Required for potential future edit modal

const ManageResourcesPage = () => {
  const { user: currentUserCollege, logout, setError } = useAuthStore();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [resources, setResources] = useState([]);
  const [isLoadingResources, setIsLoadingResources] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  const resourceCategories = [
    'Official Documents',
    'Event Materials',
    'Reports & Academic Content',
    'Administrative Documents',
  ];

  useEffect(() => {
    if (!currentUserCollege || currentUserCollege.role !== 'admin') {
      navigate('/');
      toast({
        title: "Access Denied",
        description: "You do not have administrative privileges.",
        variant: "destructive",
      });
      return;
    }
    fetchResources();
  }, [currentUserCollege, navigate, logout, setError, toast]);

  const fetchResources = async () => {
    setIsLoadingResources(true);
    try {
      const data = await resourceService.getResources(); // Admin fetches ALL resources
      setResources(data);
    } catch (err) {
      console.error('Failed to fetch resources for admin:', err);
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

  const handleDeleteResource = async (resourceId, resourceTitle) => {
    if (!window.confirm(`Are you sure you want to delete "${resourceTitle}"? This action cannot be undone.`)) {
      return;
    }
    try {
      await resourceService.deleteResource(resourceId); // Admin has delete access to any resource
      toast({
        title: "Resource Deleted",
        description: `Resource "${resourceTitle}" has been removed.`,
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

  const handleDownloadResource = async (resourceId, originalFileName) => {
    try {
      const response = await resourceService.downloadResource(resourceId);
      const blob = response.data;
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', originalFileName || 'downloaded_file');
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast({
        title: "Download Initiated",
        description: `"${originalFileName || 'file'}" is downloading...`,
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

  const handleViewResource = (resource) => {
    const fullUrl = `${import.meta.env.VITE_BACKEND_URL.replace('/api', '')}${resource.file}`;
    window.open(fullUrl, '_blank');
  };

  const filteredResources = resources.filter(resource => {
    const matchesCategory = filterCategory === 'all' ? true : resource.category === filterCategory;
    const matchesSearch = searchTerm
      ? resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.uploadedBy?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.originalFileName?.toLowerCase().includes(searchTerm.toLowerCase())
      : true;
    return matchesCategory && matchesSearch;
  });

  if (isLoadingResources) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
        <Loader2 className="w-12 h-12 mb-4 text-blue-600 animate-spin dark:text-blue-400" />
        <p className="text-xl font-medium text-gray-700 dark:text-gray-300">Loading Resources...</p>
      </div>
    );
  }

  return (
    <div className="container px-4 py-8 mx-auto md:px-6 lg:px-8">
      <h1 className="mb-8 text-4xl font-extrabold text-center text-gray-800 dark:text-gray-100">
        Admin: Manage <span className="text-red-600 dark:text-red-400">Resources</span>
      </h1>

      <div className="flex items-center justify-between mb-6">
        <Button onClick={() => navigate('/admin')} variant="outline" className="flex items-center gap-2">
          <ArrowLeftIcon className="w-4 h-4" /> Back to Admin Dashboard
        </Button>
        <div className="relative w-full max-w-sm ml-auto">
          <SearchIcon className="absolute w-4 h-4 -translate-y-1/2 left-3 top-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search resources..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-4 rounded-md pl-9"
          />
        </div>
        <Select value={filterCategory} onValueChange={setFilterCategory} className="ml-2">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {resourceCategories.map(cat => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={() => { setSearchTerm(''); setFilterCategory('all'); }} className="ml-2">
          Reset Filters
        </Button>
      </div>

      {resources.length === 0 ? (
        <div className="py-10 text-center text-gray-500 dark:text-gray-400">
          <p className="text-lg">No resources uploaded yet.</p>
        </div>
      ) : (
        <Card className="border border-gray-100 shadow-lg dark:border-gray-700">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-muted-foreground">Title</th>
                    <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-muted-foreground">Category</th>
                    <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-muted-foreground">File</th>
                    <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-muted-foreground">Uploaded By</th>
                    <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-muted-foreground">Upload Date</th>
                    <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-center uppercase text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-card dark:divide-gray-700">
                  {filteredResources.map(resource => (
                    <tr key={resource._id}>
                      <td className="px-6 py-4 text-sm font-medium whitespace-nowrap text-foreground">{resource.title}</td>
                      <td className="px-6 py-4 text-sm whitespace-nowrap text-muted-foreground">{resource.category}</td>
                      <td className="px-6 py-4 text-sm text-blue-600 cursor-pointer whitespace-nowrap dark:text-blue-400 hover:underline" onClick={() => handleViewResource(resource)}>
                        {resource.originalFileName} <EyeIcon className="inline-block w-3 h-3 ml-1" />
                      </td>
                      <td className="px-6 py-4 text-sm whitespace-nowrap text-muted-foreground">{resource.uploadedBy?.name || 'Unknown'}</td>
                      <td className="px-6 py-4 text-sm whitespace-nowrap text-muted-foreground">{new Date(resource.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
                        <div className="flex justify-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadResource(resource._id, resource.originalFileName)}
                            className="flex items-center gap-1 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            <DownloadIcon className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteResource(resource._id, resource.title)}
                            className="flex items-center gap-1"
                          >
                            <Trash2Icon className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
      <Toaster />
    </div>
  );
};

export default ManageResourcesPage;