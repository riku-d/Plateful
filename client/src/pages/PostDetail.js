import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { createCommentNotification, createLikeNotification } from '../utils/notificationUtils';

const PostDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comment, setComment] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/posts/${id}`);
        setPost(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching post:', err);
        setError('Failed to fetch post details');
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  const handleLike = async () => {
    if (!user) return;
    
    try {
      const response = await axios.put(`/api/posts/${id}/like`);
      setPost(response.data);
      
      // Create notification for post author if this is a new like (not if we unliked it)
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
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!comment.trim() || !user) return;
    
    try {
      setCommentLoading(true);
      const response = await axios.post(`/api/posts/${id}/comments`, { 
        text: comment
      });
      
      setPost(response.data);
      setComment('');
      
      // Create notification for post author if it's not our own post
      if (post.author._id !== user._id) {
        createCommentNotification(
          post._id,
          post.title,
          user._id,
          user.name,
          post.author._id
        );
      }
      
      setCommentLoading(false);
    } catch (err) {
      console.error('Error adding comment:', err);
      setCommentLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading post...</p>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error || 'Post not found'}</span>
        </div>
        <div className="mt-4">
          <Link to="/community" className="text-green-600 hover:text-green-800">
            &larr; Back to Community
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-4">
        <Link to="/community" className="text-green-600 hover:text-green-800">
          &larr; Back to Community
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h1 className="text-2xl font-bold text-green-700 mb-4">{post.title}</h1>
        <p className="text-gray-700 mb-6 whitespace-pre-line">{post.content}</p>
        
        <div className="flex justify-between items-center text-sm text-gray-500 mb-6">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-2">
              {post.author?.name?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div>
              <span className="font-medium">{post.author?.name || 'Anonymous'}</span>
              <p className="text-xs">{new Date(post.date).toLocaleString()}</p>
            </div>
          </div>
          
          <div className="flex space-x-4">
            <button 
              onClick={handleLike}
              className="flex items-center space-x-1 hover:text-green-600"
              disabled={!user}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className={`h-5 w-5 ${user && post.likes?.includes(user._id) ? 'text-green-600 fill-current' : ''}`} 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
              </svg>
              <span>{post.likes?.length || 0} Likes</span>
            </button>
            
            <div className="flex items-center space-x-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span>{post.comments?.length || 0} Comments</span>
            </div>
          </div>
        </div>
        
        {user ? (
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold mb-3">Add a Comment</h3>
            <form onSubmit={handleComment}>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                rows="3"
                placeholder="Share your thoughts on this post..."
                required
              ></textarea>
              <button
                type="submit"
                className="mt-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
                disabled={commentLoading || !comment.trim()}
              >
                {commentLoading ? 'Posting...' : 'Post Comment'}
              </button>
            </form>
          </div>
        ) : (
          <div className="border-t pt-4 text-center">
            <p className="text-gray-600">
              <Link to="/login" className="text-green-600 hover:text-green-800">Login</Link> to like or comment on this post.
            </p>
          </div>
        )}
      </div>
      
      {/* Comments Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Comments ({post.comments?.length || 0})</h2>
        
        {post.comments?.length > 0 ? (
          <div className="space-y-4">
            {post.comments.map((comment) => (
              <div key={comment._id} className="border-b pb-4 last:border-b-0">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                    {comment.author?.name?.charAt(0).toUpperCase() || 'A'}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <h4 className="font-medium">{comment.author?.name || 'Anonymous'}</h4>
                      <span className="text-xs text-gray-500">{new Date(comment.date).toLocaleString()}</span>
                    </div>
                    <p className="text-gray-700 mt-1">{comment.text}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No comments yet. Be the first to comment!</p>
        )}
      </div>
    </div>
  );
};

export default PostDetail;