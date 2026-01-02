import React from 'react';

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

export function PostList({ results, onPostClick }) {
  return (
    <div className="posts-list">
      {results.map((r) => (
        <div key={r.id} className="post-card" onClick={() => onPostClick(r.id)} style={{ cursor: 'pointer' }}>
          <div className="post-content">
            <div className="post-metadata">
              <span className="post-author">Posted by {r.author?.name || 'Anonymous'}</span>
              <span className="post-dot">•</span>
              <span className="post-time">{r.createdAt ? new Date(r.createdAt).toLocaleString() : 'Just now'}</span>
            </div>
            
            <h3 className="post-title">{r.title}</h3>
            
            <div className="post-card-meta">
              {r.community && (
                <span className="post-card-community">{r.community.name}</span>
              )}
              {r.flag && (
                <span className="post-card-flag">{getFlagIcon(r.flag.name)} {r.flag.name}</span>
              )}
            </div>
            
            <div className="post-body">{r.body}</div>
            
            <div className="post-actions">
              <button className="action-btn" onClick={(e) => e.stopPropagation()}>💬 {r.commentCount ?? 0} Comments</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
