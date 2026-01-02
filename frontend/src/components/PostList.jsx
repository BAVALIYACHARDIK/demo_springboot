import React from 'react';

export function PostList({ results, onPostClick }) {
  return (
    <div className="posts-list">
      {results.map((r) => (
        <div key={r.id} className="post-card" onClick={() => onPostClick(r.id)} style={{ cursor: 'pointer' }}>
          <div className="post-votes">
            <button className="vote-btn" onClick={(e) => e.stopPropagation()}>⬆️</button>
            <span className="vote-count">{Math.floor(Math.random() * 1000)}</span>
            <button className="vote-btn" onClick={(e) => e.stopPropagation()}>⬇️</button>
          </div>
          
          <div className="post-content">
            <div className="post-metadata">
              <span className="post-community">{r.hashtags ? (Array.isArray(r.hashtags) ? r.hashtags[0]?.name || r.hashtags[0] : r.hashtags.split(' ')[0])?.replace('@', '') || 'Programming' : 'Programming'}</span>
              <span className="post-dot">•</span>
              <span className="post-author">Posted by {r.author?.name || 'Anonymous'}</span>
              <span className="post-dot">•</span>
              <span className="post-time">{r.createdAt ? new Date(r.createdAt).toLocaleString() : 'Just now'}</span>
            </div>
            
            <h3 className="post-title">{r.title}</h3>
            
            <div className="post-body">{r.body}</div>
            
            {r.hashtags && (
              <div className="post-tags">
                {(
                  Array.isArray(r.hashtags)
                    ? r.hashtags.map((h) => (h && (h.name || h).toString()))
                    : String(r.hashtags).split(/\s+/)
                )
                  .filter(Boolean)
                  .map((t, i) => (
                    <span key={i} className="tag">{t.startsWith('@') ? t : `@${t}`}</span>
                  ))}
              </div>
            )}
            
            <div className="post-actions">
              <button className="action-btn" onClick={(e) => e.stopPropagation()}>💬 {Math.floor(Math.random() * 100)} Comments</button>
              <button className="action-btn" onClick={(e) => e.stopPropagation()}>🔗 Share</button>
              <button className="action-btn" onClick={(e) => e.stopPropagation()}>⭐ Save</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
