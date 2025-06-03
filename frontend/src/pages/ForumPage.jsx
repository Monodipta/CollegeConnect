import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, MessageCircleIcon, PlusCircleIcon, Trash2Icon, UserIcon, RefreshCcwIcon } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; // <-- CORRECTED: ADDED THIS IMPORT

import useAuthStore from '@/store/authStore';
import forumService from '@/services/forumService';
import collegeService from '@/services/collegeService';
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"; // Needed for mention suggestions styling

const ForumPage = () => {
  const { user: collegeUser, logout, setError } = useAuthStore();
  const navigate = useNavigate();
  const { toast } = useToast();

  // State for Create Post Form
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isCreatingPost, setIsCreatingPost] = useState(false);

  // State for Forum Posts List
  const [forumPosts, setForumPosts] = useState([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [allColleges, setAllColleges] = useState([]); // For mention suggestions
  const [showMentionSuggestions, setShowMentionSuggestions] = useState(false);
  const [mentionSuggestions, setMentionSuggestions] = useState([]);
  const [currentMentionTerm, setCurrentMentionTerm] = useState('');
  const [cursorPosition, setCursorPosition] = useState(0); // To insert mention at cursor

  useEffect(() => {
    if (!collegeUser) {
      navigate('/login');
      return;
    }
    fetchPosts();
    fetchAllColleges(); // Fetch all colleges for mention functionality
  }, [collegeUser, navigate, logout, setError, toast]);

  const fetchPosts = async () => {
    setIsLoadingPosts(true);
    try {
      const data = await forumService.getForumPosts();
      setForumPosts(data);
    } catch (err) {
      console.error('Failed to fetch forum posts:', err);
      const message = err.response && err.response.data && err.response.data.message
        ? err.response.data.message
        : err.message;
      setError(message);
      toast({
        title: "Error Loading Forum",
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

  const fetchAllColleges = async () => {
    try {
      const data = await collegeService.getAllColleges();
      // Filter out the current college from mention suggestions
      setAllColleges(data.filter(college => college._id !== collegeUser._id));
    } catch (err) {
      console.error('Failed to fetch colleges for mentions:', err);
      toast({
        title: "Error",
        description: "Could not load colleges for mentions.",
        variant: "destructive",
      });
    }
  };

  const handleContentChange = (e) => {
    const value = e.target.value;
    setContent(value);
    const textarea = e.target;
    setCursorPosition(textarea.selectionStart);

    // Logic for mention suggestions
    const lastAtIndex = value.lastIndexOf('@', textarea.selectionStart - 1);
    if (lastAtIndex !== -1) {
      const term = value.substring(lastAtIndex + 1, textarea.selectionStart);
      if (term.length > 0) {
        const filtered = allColleges.filter(
          (college) => college.name.toLowerCase().includes(term.toLowerCase())
        );
        setMentionSuggestions(filtered);
        setShowMentionSuggestions(true);
        setCurrentMentionTerm(term);
      } else {
        setShowMentionSuggestions(false);
      }
    } else {
      setShowMentionSuggestions(false);
    }
  };

  const handleSelectMention = (collegeName, collegeId) => {
    const lastAtIndex = content.lastIndexOf('@', cursorPosition - 1);
    if (lastAtIndex !== -1) {
      const newContent =
        content.substring(0, lastAtIndex) +
        `@${collegeName}` + // Insert the full name
        content.substring(cursorPosition);
      setContent(newContent);
      setShowMentionSuggestions(false);
      // Focus back on textarea and set cursor after mention
      setTimeout(() => {
        const textarea = document.getElementById('content');
        if (textarea) {
            textarea.focus();
            const newCursorPos = lastAtIndex + `@${collegeName}`.length;
            textarea.setSelectionRange(newCursorPos, newCursorPos);
        }
      }, 0);
    }
  };


  const handleCreatePost = async (e) => {
    e.preventDefault();

    if (!title || !content) {
      toast({
        title: "Missing Fields",
        description: "Please fill both title and content for your post.",
        variant: "destructive",
      });
      return;
    }

    setIsCreatingPost(true);

    // Parse mentions from content to send IDs to backend
    const mentionedNames = content.match(/@([a-zA-Z0-9\s_.-]+)/g) || [];
    const mentionedCollegeIds = [];

    mentionedNames.forEach(mention => {
        const collegeName = mention.substring(1); // Remove '@'
        const foundCollege = allColleges.find(col => col.name === collegeName);
        if (foundCollege) {
            mentionedCollegeIds.push(foundCollege._id);
        }
    });


    try {
      await forumService.createForumPost({
        title,
        content,
        mentionedCollegeIds: [...new Set(mentionedCollegeIds)], // Ensure unique IDs
      });
      toast({
        title: "Post Created",
        description: "Your forum post has been successfully published.",
      });
      // Clear form and re-fetch posts
      setTitle('');
      setContent('');
      fetchPosts();
    } catch (err) {
      console.error('Failed to create forum post:', err);
      const message = err.response && err.response.data && err.response.data.message
        ? err.response.data.message
        : err.message;
      setError(message);
      toast({
        title: "Post Creation Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsCreatingPost(false);
    }
  };

  const handleDeletePost = async (postId, postTitle) => {
    if (!window.confirm(`Are you sure you want to delete "${postTitle}"?`)) {
      return;
    }
    try {
      await forumService.deleteForumPost(postId);
      toast({
        title: "Post Deleted",
        description: `"${postTitle}" has been removed.`,
      });
      fetchPosts(); // Re-fetch list after deletion
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

  // Helper to highlight mentions in post content
  const renderContentWithMentions = useCallback((content, mentionedColleges) => {
    if (!mentionedColleges || mentionedColleges.length === 0) return content;

    let renderedContent = content;
    mentionedColleges.forEach(college => {
        const regex = new RegExp(`@${college.name}`, 'g');
        // Corrected: The span tag styling should be defined in CSS or Tailwind classes
        // Here, it's a simple inline style for demonstration, but Tailwind classes are preferred.
        renderedContent = renderedContent.replace(regex, `<span class="text-blue-500 dark:text-blue-300 font-semibold cursor-pointer">@${college.name}</span>`);
    });

    // Use dangerouslySetInnerHTML with caution, but it's common for rich text/mentions
    return <p dangerouslySetInnerHTML={{ __html: renderedContent }} />;
  }, []);


  return (
    <div className="container mx-auto py-8 px-4 md:px-6 lg:px-8">
      <h1 className="text-4xl font-extrabold text-gray-800 dark:text-gray-100 mb-8 text-center">
        Inter-College <span className="text-blue-600 dark:text-blue-400">Forum</span>
      </h1>

      {/* Create New Post Section */}
      <Card className="mb-8 shadow-lg border border-gray-100 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <PlusCircleIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" /> Create New Post
          </CardTitle>
          <CardDescription>Share ideas, ask questions, and discuss with other colleges.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreatePost} className="grid grid-cols-1 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Post Title</Label>
              <Input id="title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                placeholder="Write your post here. Use @ to mention colleges (e.g., @MyUniversity)."
                value={content}
                onChange={handleContentChange}
                onKeyUp={(e) => { // Hide suggestions if not typing a mention
                    if (e.key === ' ' || e.key === 'Enter') {
                        setShowMentionSuggestions(false);
                    }
                }}
                required
                rows={6}
              />
              {showMentionSuggestions && mentionSuggestions.length > 0 && (
                // Position this card absolutely relative to its parent container (which is typically a div with 'relative' class)
                // For this to work correctly, make sure the parent of this Card (e.g., the grid gap-2 div) is 'relative'.
                // If not, it will be positioned relative to the nearest positioned ancestor (often body/root).
                <Card className="absolute z-10 mt-1 max-h-48 overflow-y-auto w-[calc(100%-2rem)] md:w-[calc(50%-1rem)] lg:w-[calc(50%-1rem)]">
                    <CardContent className="p-0">
                        {mentionSuggestions.map(college => (
                            <DropdownMenuItem // Using DropdownMenuItem for styling consistency
                                key={college._id}
                                onClick={() => handleSelectMention(college.name, college._id)}
                                className="px-4 py-2 cursor-pointer hover:bg-muted flex items-center gap-2"
                            >
                                <Avatar className="h-6 w-6">
                                    {/* CORRECTED: Removed math-inline span tags */}
                                    {college.logo ? (
                                        <AvatarImage src={`${import.meta.env.VITE_BACKEND_URL.replace('/api', '')}${college.logo}`} alt={college.name} />
                                    ) : (
                                        <AvatarFallback>{college.name.charAt(0)}</AvatarFallback>
                                    )}
                                </Avatar>
                                {college.name}
                            </DropdownMenuItem>
                        ))}
                    </CardContent>
                </Card>
              )}
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={isCreatingPost} className="px-6 py-2">
                {isCreatingPost ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircleIcon className="mr-2 h-4 w-4" />}
                {isCreatingPost ? 'Posting...' : 'Post to Forum'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Forum Posts List Section */}
      <Card className="shadow-lg border border-gray-100 dark:border-gray-700">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <MessageCircleIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" /> All Discussions
          </CardTitle>
          <Button variant="outline" onClick={fetchPosts} className="flex items-center gap-2">
            <RefreshCcwIcon className="h-4 w-4" /> Refresh
          </Button>
        </CardHeader>
        <CardContent>
          {isLoadingPosts ? (
            <div className="flex justify-center items-center h-48">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
              <p className="ml-2 text-lg text-gray-600 dark:text-gray-300">Loading posts...</p>
            </div>
          ) : forumPosts.length === 0 ? (
            <div className="text-center py-10 text-gray-500 dark:text-gray-400">
              <p className="text-lg">No forum posts found.</p>
              <p className="text-sm mt-2">Be the first to start a discussion!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {forumPosts.map(post => (
                <Card key={post._id} className="shadow-md hover:shadow-lg transition-shadow duration-200 border border-gray-200 dark:border-gray-700">
                  <CardHeader className="pb-3 flex-row items-center space-x-3">
                    <Avatar className="h-8 w-8">
                        {post.postedBy?.logo ? (
                            // CORRECTED: Removed math-inline span tags
                            <AvatarImage src={`${import.meta.env.VITE_BACKEND_URL.replace('/api', '')}${post.postedBy.logo}`} alt={post.postedBy.name} />
                        ) : (
                            <AvatarFallback className="bg-primary text-primary-foreground text-sm">{post.postedBy?.name?.charAt(0) || '?'}</AvatarFallback>
                        )}
                    </Avatar>
                    <div>
                        <CardTitle className="text-lg font-semibold">{post.title}</CardTitle>
                        <CardDescription className="text-xs text-muted-foreground">
                            Posted by {post.postedBy?.name || 'Unknown'} on {new Date(post.createdAt).toLocaleDateString()}
                        </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="text-sm text-gray-700 dark:text-gray-300 pb-3">
                    {renderContentWithMentions(post.content, post.mentionedColleges)}
                    {post.mentionedColleges && post.mentionedColleges.length > 0 && (
                      <div className="mt-2 text-xs text-muted-foreground">
                        Mentioned: {post.mentionedColleges.map(mc => `@${mc.name}`).join(', ')}
                      </div>
                    )}
                  </CardContent>
                  <div className="p-4 border-t flex justify-end items-center bg-muted/20">
                    {/* Future: Add Reply button */}
                    {/* <Button variant="ghost" size="sm" className="flex items-center gap-1">
                      <MessageCircleIcon className="h-4 w-4" /> Reply
                    </Button> */}
                    {post.postedBy?._id === collegeUser?._id && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeletePost(post._id, post.title)}
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

export default ForumPage;