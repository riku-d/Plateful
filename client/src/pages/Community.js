import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { createLikeNotification, createCommentNotification } from '../utils/notificationUtils';

const Community = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState({ title: '', content: '', author: user?._id });
  
  // Update author when user changes
  useEffect(() => {
    if (user) {
      setNewPost(prev => ({ ...prev, author: user._id }));
    }
  }, [user]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/posts');
        setPosts(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching posts:', err);
        setError('Failed to fetch community posts');
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewPost(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitPost = async (e) => {
    e.preventDefault();
    if (!newPost.title || !newPost.content) return;

    try {
      const response = await axios.post('/api/posts', newPost);
      setPosts(prev => [response.data, ...prev]);
      setNewPost({ title: '', content: '', author: user?._id });
      
      // No notification needed for creating your own post
    } catch (err) {
      console.error('Error creating post:', err);
      setError('Failed to create post');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-green-700 mb-8">Community Forum</h1>
      
      {user && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Create a New Post</h2>
          <form onSubmit={handleSubmitPost}>
            <div className="mb-4">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                id="title"
                name="title"
                value={newPost.title}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Post title"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">Content</label>
              <textarea
                id="content"
                name="content"
                value={newPost.content}
                onChange={handleInputChange}
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Share your thoughts, ideas, or questions with the community..."
                required
              ></textarea>
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              Post to Community
            </button>
          </form>
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading community posts...</p>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map(post => (
            <div key={post._id} className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-green-700 mb-2">{post.title}</h2>
              <p className="text-gray-600 mb-4">{post.content}</p>
              <div className="flex justify-between items-center text-sm text-gray-500">
                <div>
                  <span className="font-medium">{post.author?.name || 'Anonymous'}</span> • {new Date(post.date).toLocaleDateString()}
                </div>
                <div className="flex space-x-4">
                  <button 
                    className="flex items-center space-x-1 hover:text-green-600"
                    onClick={async () => {
                      if (!user) return;
                      try {
                        const response = await axios.put(`/api/posts/${post._id}/like`);
                        // Update post in state with new likes
                        setPosts(prev => prev.map(p => p._id === post._id ? response.data : p));
                        
                        // Create notification for post author if we liked the post (not if we unliked it)
                        const didLike = response.data.likes.includes(user._id);
                        if (didLike && post.author._id !== user._id) {
                          createLikeNotification(
                            post._id,
                            post.title,
                            user._id,
                            user.name,
                            post.author._id
                          );
                        }
                      } catch (err) {
                        console.error('Error liking post:', err);
                      }
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" 
                      className={`h-5 w-5 ${user && post.likes?.includes(user._id) ? 'text-green-600 fill-current' : ''}`} 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                    </svg>
                    <span>{post.likes?.length || 0}</span>
                  </button>
                  <Link to={`/community/${post._id}`} className="flex items-center space-x-1 hover:text-green-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <span>{post.comments?.length || 0}</span>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Community;