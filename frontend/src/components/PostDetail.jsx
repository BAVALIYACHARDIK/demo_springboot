import React, { useState, useEffect } from 'react';
import API from '../services/Dashboardapi';

// Helper function to get flag icon
const getFlagIcon = (flagName) => {
  const flagIcons = {
    "Error": "🔴",
    "Doubt": "❓",
    "Meme": "😂",
    "How To": "📖",
  };
  return flagIcons[flagName] || "🏳️";
};

export function PostDetail({ postId, onBack }) {
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [expandedReplies, setExpandedReplies] = useState(new Set());
  const [loadingReplies, setLoadingReplies] = useState({});

  useEffect(() => {
    loadPostDetail();
  }, [postId]);

  const loadPostDetail = async () => {
    setLoading(true);
    try {
      const [postData, commentsData] = await Promise.all([
        API.getPost(postId),
        API.getPostComments(postId)
      ]);
      setPost(postData);
      // Only set top-level comments (direct children of post)
      setComments(Array.isArray(commentsData) ? commentsData : []);
    } catch (e) {
      console.error('Failed to load post', e);
    } finally {
      setLoading(false);
    }
  };

  const updateCommentReplies = (comments, commentId, replies) => {
    return comments.map(c => {
      if (c.id === commentId) {
        return { ...c, replies: Array.isArray(replies) ? replies : [] };
      }
      // Recursively search in nested replies
      if (c.replies && c.replies.length > 0) {
        return { ...c, replies: updateCommentReplies(c.replies, commentId, replies) };
      }
      return c;
    });
  };

  const toggleReplies = async (commentId) => {
    if (expandedReplies.has(commentId)) {
      // Collapse - just remove from expanded set
      setExpandedReplies(prev => {
        const newSet = new Set(prev);
        newSet.delete(commentId);
        return newSet;
      });
    } else {
      // Expand and fetch replies only if not already loaded
      setLoadingReplies(prev => ({ ...prev, [commentId]: true }));
      try {
        const replies = await API.getCommentChildren(commentId);
        // Store replies in the parent comment recursively
        setComments(prev => updateCommentReplies(prev, commentId, replies));
        setExpandedReplies(prev => new Set(prev).add(commentId));
      } catch (e) {
        console.error('Failed to load replies', e);
        alert('Failed to load replies');
      } finally {
        setLoadingReplies(prev => ({ ...prev, [commentId]: false }));
      }
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    
    setSubmitting(true);
    try {
      const uid = localStorage.getItem('user_id');
      await API.createComment({
        postId: postId,
        authorId: uid ? Number(uid) : null,
        body: commentText,
        parentId: null // Top-level comment
      });
      setCommentText('');
      // Reload comments
      const commentsData = await API.getPostComments(postId);
      setComments(Array.isArray(commentsData) ? commentsData : []);
    } catch (e) {
      console.error('Failed to post comment', e);
      alert('Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitReply = async (e, parentCommentId) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    
    setSubmitting(true);
    try {
      const uid = localStorage.getItem('user_id');
      await API.createComment({
        postId: postId,
        authorId: uid ? Number(uid) : null,
        body: replyText,
        parentId: parentCommentId // Nested reply
      });
      setReplyText('');
      setReplyingTo(null);
      // Reload replies for this comment recursively
      const replies = await API.getCommentChildren(parentCommentId);
      setComments(prev => updateCommentReplies(prev, parentCommentId, replies));
    } catch (e) {
      console.error('Failed to post reply', e);
      alert('Failed to post reply');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!post) {
    return <div className="error">Post not found</div>;
  }

  const renderComment = (comment, depth = 0) => (
    <div key={comment.id} className={`comment-item comment-depth-${Math.min(depth, 3)}`}>
      <div className="comment-header">
        <span className="comment-author">{comment.author?.name || 'Anonymous'}</span>
        <span className="comment-dot">•</span>
        <span className="comment-time">{comment.createdAt ? new Date(comment.createdAt).toLocaleString() : 'Just now'}</span>
      </div>
      <div className="comment-body">{comment.body}</div>
      <div className="comment-actions">
        <button className="comment-action-btn" onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}>
          ↩️ Reply
        </button>
        {comment.replyCount > 0 && (
          <button 
            className="comment-action-btn" 
            onClick={() => toggleReplies(comment.id)}
            disabled={loadingReplies[comment.id]}
          >
            {expandedReplies.has(comment.id) 
              ? `▲ Hide ${comment.replyCount} ${comment.replyCount === 1 ? 'reply' : 'replies'}`
              : `▼ Show ${comment.replyCount} ${comment.replyCount === 1 ? 'reply' : 'replies'}`
            }
          </button>
        )}
      </div>

      {/* Reply Form */}
      {replyingTo === comment.id && (
        <form className="reply-form" onSubmit={(e) => handleSubmitReply(e, comment.id)}>
          <textarea
            placeholder="Reply to this comment..."
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            rows={3}
            disabled={submitting}
          />
          <div className="reply-actions">
            <button type="submit" className="btn-comment" disabled={submitting || !replyText.trim()}>
              {submitting ? 'Posting...' : 'Reply'}
            </button>
            <button type="button" className="btn-comment-cancel" onClick={() => setReplyingTo(null)}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Nested Replies - Only shown when expanded */}
      {expandedReplies.has(comment.id) && comment.replies && comment.replies.length > 0 && (
        <div className="replies-section">
          {comment.replies.map((reply) => renderComment(reply, depth + 1))}
        </div>
      )}
    </div>
  );

  return (
    <div className="post-detail-container">
      <button className="back-button" onClick={onBack}>
        ← Back to posts
      </button>

      <div className="post-detail-card">
        <div className="post-detail-votes">
          <button className="vote-btn">⬆️</button>
          <span className="vote-count">{Math.floor(Math.random() * 1000)}</span>
          <button className="vote-btn">⬇️</button>
        </div>

        <div className="post-detail-content">
          <div className="post-detail-metadata">
            <span className="post-author">Posted by {post.author?.name || 'Anonymous'}</span>
            <span className="post-dot">•</span>
            <span className="post-time">{post.createdAt ? new Date(post.createdAt).toLocaleString() : 'Just now'}</span>
          </div>

          <h1 className="post-detail-title">{post.title}</h1>

          <div className="post-detail-meta-info">
            {post.community && (
              <div className="post-community">
                <span className="meta-value community-badge">{post.community.name}</span>
              </div>
            )}
            {post.flag && (
              <div className="post-flag">
                <span className="meta-value flag-badge">{getFlagIcon(post.flag.name)} {post.flag.name}</span>
              </div>
            )}
          </div>

          <div className="post-detail-body">{post.body}</div>

          <div className="post-actions">
            <button className="action-btn">💬 {comments.length} Comments</button>
            <button className="action-btn">🔗 Share</button>
            <button className="action-btn">⭐ Save</button>
          </div>
        </div>
      </div>

      <div className="comments-section">
        <h3>Comments ({comments.length})</h3>
        
        <form className="comment-form" onSubmit={handleSubmitComment}>
          <textarea
            placeholder="What are your thoughts?"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            rows={4}
            disabled={submitting}
          />
          <button type="submit" className="btn-comment" disabled={submitting || !commentText.trim()}>
            {submitting ? 'Posting...' : 'Comment'}
          </button>
        </form>

        <div className="comments-list">
          {comments.length === 0 ? (
            <div className="no-comments">No comments yet. Be the first to comment!</div>
          ) : (
            comments.map((comment) => renderComment(comment))
          )}
        </div>
      </div>
    </div>
  );
}
