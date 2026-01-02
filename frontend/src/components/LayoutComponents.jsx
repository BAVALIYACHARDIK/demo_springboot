import React, { useState, useEffect, useRef } from 'react';
import API from '../services/Dashboardapi';

export function Navbar({ query, setQuery, onSearch, onLogout }) {
  return (
    <header className="reddit-navbar">
      <div className="navbar-left">
        <div className="logo">DevCommunity</div>
        <div className="searchbar">
          <input
            aria-label="Search"
            placeholder="Find anything"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") onSearch(); }}
          />
        </div>
      </div>
      <div className="navbar-right">
        <button className="btn-logout" onClick={onLogout}>Log Out</button>
      </div>
    </header>
  );
}

export function LeftSidebar() {
  return (
    <aside className="left-sidebar">
      <nav className="sidebar-nav">
        <a href="#" className="nav-item active">
          <span className="nav-icon">🏠</span>
          <span>Home</span>
        </a>
        <a href="#" className="nav-item">
          <span className="nav-icon">🔥</span>
          <span>Popular</span>
        </a>
        <a href="#" className="nav-item">
          <span className="nav-icon">🧭</span>
          <span>Explore</span>
        </a>
      </nav>
      <div className="sidebar-section">
        <div className="section-title">RESOURCES</div>
        <a href="#" className="nav-item">
          <span className="nav-icon">ℹ️</span>
          <span>About</span>
        </a>
        <a href="#" className="nav-item">
          <span className="nav-icon">📢</span>
          <span>Advertise</span>
        </a>
        <a href="#" className="nav-item">
          <span className="nav-icon">💻</span>
          <span>Developer Platform</span>
        </a>
        <a href="#" className="nav-item">
          <span className="nav-icon">❓</span>
          <span>Help</span>
        </a>
      </div>
    </aside>
  );
}

export function RightSidebar({ onAddPost, onCommunityClick, selectedCommunityId }) {
  const [communities, setCommunities] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const listRef = useRef(null);

  // Load initial communities
  useEffect(() => {
    loadCommunities(0);
  }, []);

  const loadCommunities = async (pageNumber) => {
    if (loading) return;
    
    setLoading(true);
    try {
      const response = await API.getCommunitiesPaginated(pageNumber, 15);
      
      if (pageNumber === 0) {
        setCommunities(response.content || []);
      } else {
        setCommunities(prev => [...prev, ...(response.content || [])]);
      }
      
      setHasMore(response.hasNext || false);
      setPage(pageNumber);
    } catch (e) {
      console.error('Failed to load communities', e);
    } finally {
      setLoading(false);
    }
  };

  // Handle scroll event for infinite loading
  const handleScroll = (e) => {
    const element = e.target;
    const bottom = element.scrollHeight - element.scrollTop <= element.clientHeight + 50;
    
    if (bottom && hasMore && !loading) {
      loadCommunities(page + 1);
    }
  };

  return (
    <aside className="right-sidebar">
      <button className="btn-create-post" onClick={onAddPost}>
        + Create Post
      </button>
      
      <div className="communities-widget">
        <div className="widget-header">POPULAR COMMUNITIES</div>
        <div 
          className="communities-list" 
          ref={listRef}
          onScroll={handleScroll}
        >
          {communities.map((community) => (
            <a 
              href="#" 
              key={community.id} 
              className={`community-item ${selectedCommunityId === community.id ? 'active' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                onCommunityClick(community.id);
              }}
            >
              <div className="community-info">
                <div className="community-details">
                  <div className="community-name">{community.name}</div>
                </div>
              </div>
            </a>
          ))}
          {loading && (
            <div className="loading-more">Loading more...</div>
          )}
          {!hasMore && communities.length > 0 && (
            <div className="no-more">No more communities</div>
          )}
        </div>
      </div>
    </aside>
  );
}
