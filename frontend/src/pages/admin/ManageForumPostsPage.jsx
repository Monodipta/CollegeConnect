import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, MessageCircleIcon, Trash2Icon, EyeIcon, SearchIcon, ArrowLeftIcon } from 'lucide-react';

import useAuthStore from '@/store/authStore';
import forumService from '@/services/forumService';
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"; // For mention suggestions, although not active in this admin view

const ManageForumPostsPage = () => {
  const { user: currentUserCollege, logout, setError } = useAuthStore();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [forumPosts, setForumPosts] = useState([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

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
    fetchForumPosts();
  }, [currentUserCollege, navigate, logout, setError, toast]);

  const fetchForumPosts = async () => {
    setIsLoadingPosts(true);
    try {
      const data = await forumService.getForumPosts(); // Admin fetches ALL posts
      setForumPosts(data);
    } catch (err) {
      console.error('Failed to fetch forum posts for admin:', err);
      const message = err.response && err.response.data && err.response.data.message
        ? err.response.data.message
        : err.message;
      setError(message);
      toast({
        title: "Error Loading Forum Posts",
        description: message,
        variant: "destructive",
      });
      if (err.response && err.response.status === 401) {
        logout();
        navigate('/login');
      }
    } finally {
      setIsLoadingPosts(false);
    }
  };

  const handleDeletePost = async (postId, postTitle) => {
    if (!window.confirm(`Are you sure you want to delete "${postTitle}"? This action cannot be undone.`)) {
      return;
    }
    try {
      await forumService.deleteForumPost(postId); // Admin has delete access to any post
      toast({
        title: "Post Deleted",
        description: `Forum post "${postTitle}" has been removed.`,
      });
      fetchForumPosts();
    } catch (err) {
      console.error('Failed to delete post:', err);
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

  // Helper to highlight mentions in post content (reused from ForumPage)
  const renderContentWithMentions = useCallback((content, mentionedColleges) => {
    if (!mentionedColleges || mentionedColleges.length === 0) return content;

    let renderedContent = content;
    mentionedColleges.forEach(college => {
        const regex = new RegExp(`@${college.name}`, 'g');
        renderedContent = renderedContent.replace(regex, `<span class="text-blue-500 dark:text-blue-300 font-semibold cursor-pointer">@${college.name}</span>`);
    });
    return <p dangerouslySetInnerHTML={{ __html: renderedContent }} />;
  }, []);

  const filteredPosts = forumPosts.filter(post => {
    return post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
           post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
           post.postedBy?.name?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (isLoadingPosts) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
        <Loader2 className="w-12 h-12 mb-4 text-blue-600 animate-spin dark:text-blue-400" />
        <p className="text-xl font-medium text-gray-700 dark:text-gray-300">Loading Forum Posts...</p>
      </div>
    );
  }

  return (
    <div className="container px-4 py-8 mx-auto md:px-6 lg:px-8">
      <h1 className="mb-8 text-4xl font-extrabold text-center text-gray-800 dark:text-gray-100">
        Admin: Manage <span className="text-red-600 dark:text-red-400">Forum Posts</span>
      </h1>

      <div className="flex items-center justify-between mb-6">
        <Button onClick={() => navigate('/admin')} variant="outline" className="flex items-center gap-2">
          <ArrowLeftIcon className="w-4 h-4" /> Back to Admin Dashboard
        </Button>
        <div className="relative w-full max-w-sm ml-auto">
          <SearchIcon className="absolute w-4 h-4 -translate-y-1/2 left-3 top-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search posts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-4 rounded-md pl-9"
          />
        </div>
      </div>

      {forumPosts.length === 0 ? (
        <div className="py-10 text-center text-gray-500 dark:text-gray-400">
          <p className="text-lg">No forum posts found yet.</p>
        </div>
      ) : (
        <Card className="border border-gray-100 shadow-lg dark:border-gray-700">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-muted-foreground">Title</th>
                    <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-muted-foreground">Content</th>
                    <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-muted-foreground">Posted By</th>
                    <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left uppercase text-muted-foreground">Post Date</th>
                    <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-center uppercase text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-card dark:divide-gray-700">
                  {filteredPosts.map(post => (
                    <tr key={post._id}>
                      <td className="px-6 py-4 text-sm font-medium whitespace-nowrap text-foreground">{post.title}</td>
                      <td className="max-w-xs px-6 py-4 text-sm truncate text-muted-foreground" title={post.content}>
                        {renderContentWithMentions(post.content, post.mentionedColleges)}
                      </td>
                      <td className="px-6 py-4 text-sm whitespace-nowrap text-muted-foreground">{post.postedBy?.name || 'Unknown'}</td>
                      <td className="px-6 py-4 text-sm whitespace-nowrap text-muted-foreground">{new Date(post.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
                        <div className="flex justify-center space-x-2">
                          {/* No View/Edit for simplicity for Admin Forum */}
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeletePost(post._id, post.title)}
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

export default ManageForumPostsPage;