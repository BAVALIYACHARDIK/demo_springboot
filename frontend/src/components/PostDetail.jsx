import React, { useState, useEffect } from 'react';
import API from '../services/Dashboardapi';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";

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

export function PostDetail({ postId, onBack, joinedCommunities, onCommunityJoinToggle }) {
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [expandedReplies, setExpandedReplies] = useState(new Set());
  const [loadingReplies, setLoadingReplies] = useState({});
  const [joiningCommunity, setJoiningCommunity] = useState(false);

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

  const handleJoinToggle = async () => {
    if (!post || !post.community) return;
    
    setJoiningCommunity(true);
    try {
      const userId = localStorage.getItem('user_id');
      await API.toggleCommunityMembership(post.community.id, userId);
      // Notify parent to refresh joined communities
      if (onCommunityJoinToggle) {
        onCommunityJoinToggle();
      }
    } catch (e) {
      console.error('Failed to toggle community membership', e);
      alert('Failed to update community membership');
    } finally {
      setJoiningCommunity(false);
    }
  };

  if (loading) {
    return <div className="bg-[#0F172A] border border-[#38BDF8]/20 rounded-lg shadow-lg py-12 px-6 text-center text-[#E5E7EB] text-sm">Loading...</div>;
  }

  if (!post) {
    return <div className="bg-[#0F172A] border border-[#38BDF8]/20 rounded-lg shadow-lg py-12 px-6 text-center text-[#E5E7EB] text-sm">Post not found</div>;
  }

  const renderComment = (comment, depth = 0) => (
    <Card key={comment.id} className={`bg-[#020617] border border-[#38BDF8]/20 transition-all ${depth === 0 ? '' : 'shadow-sm'}`}>
      <CardContent className="p-3">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-bold text-[#E5E7EB]">{comment.author?.name || 'Anonymous'}</span>
          <span className="text-xs text-[#E5E7EB]/70">•</span>
          <span className="text-xs text-[#E5E7EB]/70">{comment.createdAt ? new Date(comment.createdAt).toLocaleString() : 'Just now'}</span>
        </div>
        <div className="text-sm text-[#E5E7EB]/80 leading-relaxed mb-2">{comment.body}</div>
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" className="bg-[#38BDF8]/10 text-[#38BDF8] border border-[#38BDF8]/30 hover:bg-[#38BDF8]/20 h-7 text-xs" onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}>
            ↩️ Reply
          </Button>
          {comment.replyCount > 0 && (
            <Button 
              size="sm"
              variant="secondary"
              className="bg-[#38BDF8]/10 text-[#38BDF8] border border-[#38BDF8]/30 hover:bg-[#38BDF8]/20 h-7 text-xs" 
              onClick={() => toggleReplies(comment.id)}
              disabled={loadingReplies[comment.id]}
            >
              {expandedReplies.has(comment.id) 
                ? `▲ Hide ${comment.replyCount} ${comment.replyCount === 1 ? 'reply' : 'replies'}`
                : `▼ Show ${comment.replyCount} ${comment.replyCount === 1 ? 'reply' : 'replies'}`
              }
            </Button>
          )}
        </div>

        {/* Reply Form */}
        {replyingTo === comment.id && (
          <form className="flex flex-col gap-2 mt-3 p-3 bg-[#0F172A] border border-[#38BDF8]/20 rounded-lg" onSubmit={(e) => handleSubmitReply(e, comment.id)}>
            <Textarea
              className="bg-[#020617] text-[#E5E7EB] border border-[#38BDF8]/30 placeholder:text-[#E5E7EB]/50"
              placeholder="Reply to this comment..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              rows={3}
              disabled={submitting}
            />
            <div className="flex gap-2">
              <Button size="sm" type="submit" className="bg-[#38BDF8] text-[#020617] hover:bg-[#38BDF8]/80" disabled={submitting || !replyText.trim()}>
                {submitting ? 'Posting...' : 'Reply'}
              </Button>
              <Button size="sm" type="button" variant="outline" className="bg-[#020617] text-[#E5E7EB] border border-[#38BDF8]/30 hover:bg-[#38BDF8]/10" onClick={() => setReplyingTo(null)}>
                Cancel
              </Button>
            </div>
          </form>
        )}

        {/* Nested Replies - Only shown when expanded */}
        {expandedReplies.has(comment.id) && comment.replies && comment.replies.length > 0 && (
          <div className="mt-3 ml-4 pl-3 flex flex-col gap-3">
            {comment.replies.map((reply) => renderComment(reply, depth + 1))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="flex flex-col gap-4">
      <Button variant="outline" className="bg-[#38BDF8]/10 text-[#38BDF8] border border-[#38BDF8]/30 hover:bg-[#38BDF8]/20 w-fit" onClick={onBack}>
        ← Back to posts
      </Button>

      {post.community && (
        <Card className="bg-[#0F172A] border border-[#38BDF8]/30 shadow-lg">
          <CardContent className="p-4 flex justify-between items-center">
            <div className="flex flex-col gap-1">
              <CardTitle className="text-base text-[#E5E7EB]">{post.community.name}</CardTitle>
              <Badge variant="outline" className="text-xs text-[#22D3EE] border border-[#22D3EE]/30 bg-[#22D3EE]/10 w-fit">Community</Badge>
            </div>
            <Button 
              variant="secondary"
              className="bg-[#38BDF8] text-[#020617] hover:bg-[#38BDF8]/80"
              onClick={handleJoinToggle}
              disabled={joiningCommunity}
            >
              {joiningCommunity ? 'Loading...' : (joinedCommunities?.some(c => c.id === post.community.id) ? 'Leave' : 'Join')}
            </Button>
          </CardContent>
        </Card>
      )}

      <Card className="bg-[#0F172A] border border-[#38BDF8]/20 shadow-lg">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 text-xs text-[#E5E7EB]/70 mb-3">
            <span className="font-medium">Posted by {post.author?.name || 'Anonymous'}</span>
            <span>•</span>
            <span>{post.createdAt ? new Date(post.createdAt).toLocaleString() : 'Just now'}</span>
          </div>

          <h1 className="text-lg font-bold text-[#E5E7EB] my-0 mb-3 leading-tight">{post.title}</h1>

          <div className="flex gap-2 mb-3 flex-wrap">
            {post.flag && (
              <Badge className="bg-[#38BDF8] text-[#020617] hover:bg-[#38BDF8]/80">{getFlagIcon(post.flag.name)} {post.flag.name}</Badge>
            )}
          </div>

          <div className="text-sm text-[#E5E7EB]/80 leading-relaxed mb-4 whitespace-pre-wrap">{post.body}</div>

          <div className="flex gap-2 mt-3">
            <Button size="sm" variant="secondary" className="bg-[#38BDF8]/10 text-[#38BDF8] border border-[#38BDF8]/30 hover:bg-[#38BDF8]/20 h-8">💬 {comments.length} Comments</Button>
            <Button size="sm" variant="secondary" className="bg-[#38BDF8]/10 text-[#38BDF8] border border-[#38BDF8]/30 hover:bg-[#38BDF8]/20 h-8">🔗 Share</Button>
            <Button size="sm" variant="secondary" className="bg-[#22D3EE]/10 text-[#22D3EE] border border-[#22D3EE]/30 hover:bg-[#22D3EE]/20 h-8">⭐ Save</Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-[#0F172A] border border-[#38BDF8]/20 shadow-lg">
        <CardHeader>
          <CardTitle className="text-base text-[#E5E7EB]">Comments ({comments.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-3 mb-6" onSubmit={handleSubmitComment}>
            <Textarea
              className="bg-[#020617] text-[#E5E7EB] border border-[#38BDF8]/30 placeholder:text-[#E5E7EB]/50"
              placeholder="What are your thoughts?"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              rows={3}
              disabled={submitting}
            />
            <Button type="submit" className="self-end bg-[#38BDF8] text-[#020617] hover:bg-[#38BDF8]/80" disabled={submitting || !commentText.trim()}>
              {submitting ? 'Posting...' : 'Comment'}
            </Button>
          </form>
          <Separator className="mb-6 bg-[#38BDF8]/20" />

          <div className="flex flex-col gap-4">
            {comments.length === 0 ? (
              <div className="text-center py-10 px-6">
                <div className="text-3xl mb-2">💬</div>
                <div className="text-[#E5E7EB]/70 text-sm font-medium">No comments yet. Be the first to comment!</div>
              </div>
            ) : (
              comments.map((comment) => renderComment(comment))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
