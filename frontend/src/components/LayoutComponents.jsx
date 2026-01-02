import React from 'react';

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

export function RightSidebar({ onAddPost }) {
  const communities = [
    { name: "JavaScript", members: "2,456,789", icon: "🟨" },
    { name: "Python", members: "1,987,654", icon: "🐍" },
    { name: "Java", members: "1,543,210", icon: "☕" },
    { name: "C++", members: "987,432", icon: "⚙️" },
    { name: "TypeScript", members: "876,543", icon: "🔷" },
    { name: "Rust", members: "654,321", icon: "🦀" },
    { name: "Go", members: "543,210", icon: "🐹" },
    { name: "C#", members: "432,109", icon: "#️⃣" },
    { name: "Ruby", members: "321,098", icon: "💎" },
    { name: "Swift", members: "298,765", icon: "🍎" }
  ];

  return (
    <aside className="right-sidebar">
      <button className="btn-create-post" onClick={onAddPost}>
        + Create Post
      </button>
      
      <div className="communities-widget">
        <div className="widget-header">POPULAR COMMUNITIES</div>
        <div className="communities-list">
          {communities.map((community, idx) => (
            <a href="#" key={idx} className="community-item">
              <div className="community-info">
                <span className="community-icon">{community.icon}</span>
                <div className="community-details">
                  <div className="community-name">{community.name}</div>
                  <div className="community-members">{community.members} members</div>
                </div>
              </div>
            </a>
          ))}
        </div>
        <a href="#" className="see-more">See more</a>
      </div>
    </aside>
  );
}
