import React, { useState, useMemo, useEffect } from "react";
import API from "../services/Dashboardapi";
import { useNavigate } from "react-router-dom";
import { Navbar, LeftSidebar, RightSidebar } from "../components/LayoutComponents";
import { PostList } from "../components/PostList";
import { PostDetail } from "../components/PostDetail";

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

export function Dashboard() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ authorId: "", title: "", community: "", flag: "", description: "" });
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [selectedCommunityId, setSelectedCommunityId] = useState(null);
  const [communities, setCommunities] = useState([]);
  const [flags, setFlags] = useState([]);

  // Load posts when community filter changes
  useEffect(() => {
    loadPosts(selectedCommunityId);
  }, [selectedCommunityId]);

  const loadPosts = async (communityId) => {
    try {
      const res = await API.getAllPosts({ communityId });
      setResults(Array.isArray(res) ? res : []);
    } catch (e) {
      console.error("Failed to load posts", e);
      setResults([]);
    }
  };

  const handleCommunityClick = (communityId) => {
    setSelectedCommunityId(communityId);
  };

  const handleClearFilter = () => {
    setSelectedCommunityId(null);
  };

  const doSearch = async () => {
    const q = (query || "").trim();
    try {
      const res = await API.search(q);
      setResults(Array.isArray(res) ? res : []);
    } catch (e) {
      console.error("search failed", e);
      setResults([]);
    }
  };

  const handleLogout = () => {
    navigate('/auth/login');
  };

  const openModal = async () => {
    setShowModal(true);
    // Lazy load communities and flags only when modal opens
    if (communities.length === 0 || flags.length === 0) {
      try {
        const [communitiesRes, flagsRes] = await Promise.all([
          API.getAllCommunities(),
          API.getAllFlags()
        ]);
        setCommunities(Array.isArray(communitiesRes) ? communitiesRes : []);
        setFlags(Array.isArray(flagsRes) ? flagsRes : []);
      } catch (e) {
        console.error("Failed to load modal data", e);
        setCommunities([]);
        setFlags([]);
      }
    }
  };
  const closeModal = () => {
    setShowModal(false);
    setForm({ authorId: "", title: "", community: "", flag: "", description: "" });
  };

  const submitPost = async () => {
    const payload = {
      title: form.title,
      body: form.description,
    };
    const uid = localStorage.getItem('user_id');
    if (uid) payload.authorId = Number(uid);
    if (form.community) payload.community = form.community;
    if (form.flag) payload.flag = form.flag;
    try {
      await API.createPost(payload);
      await loadPosts(selectedCommunityId);
      closeModal();
    } catch (e) {
      console.error("post failed", e);
      alert(e.message || "Failed to create post");
    }
  };

  const handlePostClick = (postId) => {
    setSelectedPostId(postId);
  };

  const handleBackToList = () => {
    setSelectedPostId(null);
  };

  return (
    <div className="dashboard-layout">
      <Navbar query={query} setQuery={setQuery} onSearch={doSearch} onLogout={handleLogout} />
      
      <div className="dashboard-container">
        <LeftSidebar />
        
        <main className="main-feed">
          {selectedPostId ? (
            <PostDetail postId={selectedPostId} onBack={handleBackToList} />
          ) : (
            <>
              <div className="feed-header">
                <div className="sort-tabs">
                  <button className="sort-tab active">🔥 Hot</button>
                  <button className="sort-tab">🆕 New</button>
                  <button className="sort-tab">⬆️ Top</button>
                </div>
              </div>

              {query && <div className="search-info">Results for "{query}"</div>}
              
              {selectedCommunityId && (
                <div className="filter-info">
                  <span>Filtered by community</span>
                  <button className="clear-filter-btn" onClick={handleClearFilter}>✕ Clear filter</button>
                </div>
              )}
              
              {results.length === 0 ? (
                <div className="no-posts">{query ? 'No results found.' : 'No posts yet. Create your first post!'}</div>
              ) : (
                <PostList results={results} onPostClick={handlePostClick} />
              )}
            </>
          )}
        </main>
        
        <RightSidebar onAddPost={openModal} onCommunityClick={handleCommunityClick} selectedCommunityId={selectedCommunityId} />
      </div>

      {showModal && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal">
            <h3>Create New Post</h3>
            <div className="modal-body">
              <div className="modal-field">
                <label className="modal-label">Title</label>
                <input className="modal-input" placeholder="Enter post title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </div>

              <div className="modal-row-inline">
                <div className="modal-field">
                  <label className="modal-label">Community</label>
                  <select className="modal-select" value={form.community} onChange={(e) => setForm({ ...form, community: e.target.value })}>
                    <option value="">Select a community...</option>
                    {communities.map((community) => (
                      <option key={community.id} value={community.name}>
                        {community.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="modal-field">
                  <label className="modal-label">Flag</label>
                  <select className="modal-select" value={form.flag} onChange={(e) => setForm({ ...form, flag: e.target.value })}>
                    <option value="">Select a flag...</option>
                    {flags.map((flag) => (
                      <option key={flag.id} value={flag.name}>
                        {getFlagIcon(flag.name)} {flag.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="modal-field">
                <label className="modal-label">Description</label>
                <textarea className="modal-textarea" placeholder="Write your detailed description here..." rows={6} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>

              <div className="modal-actions">
                <button className="btn-small btn-secondary" onClick={closeModal}>Discard</button>
                <button className="btn-small btn-primary" onClick={submitPost}>Post</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
