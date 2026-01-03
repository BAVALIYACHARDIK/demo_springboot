import React, { useState, useMemo, useEffect, useRef } from "react";
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
  const [communitySuggestions, setCommunitySuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const throttleTimerRef = useRef(null);

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
    // Lazy load flags only when modal opens
    if (flags.length === 0) {
      try {
        const flagsRes = await API.getAllFlags();
        setFlags(Array.isArray(flagsRes) ? flagsRes : []);
      } catch (e) {
        console.error("Failed to load flags", e);
        setFlags([]);
      }
    }
  };
  const closeModal = () => {
    setShowModal(false);
    setForm({ authorId: "", title: "", community: "", flag: "", description: "" });
    setCommunitySuggestions([]);
    setShowSuggestions(false);
    if (throttleTimerRef.current) {
      clearTimeout(throttleTimerRef.current);
    }
  };

  // Throttled search function for communities
  const searchCommunitiesThrottled = (searchText) => {
    // Clear any existing timer
    if (throttleTimerRef.current) {
      clearTimeout(throttleTimerRef.current);
    }

    // Set new timer for 350ms
    throttleTimerRef.current = setTimeout(async () => {
      const trimmedText = searchText.trim();
      if (trimmedText.length === 0) {
        setCommunitySuggestions([]);
        setShowSuggestions(false);
        return;
      }

      try {
        const results = await API.searchCommunities(trimmedText);
        setCommunitySuggestions(Array.isArray(results) ? results : []);
        setShowSuggestions(true);
      } catch (e) {
        console.error("Failed to search communities", e);
        setCommunitySuggestions([]);
        setShowSuggestions(false);
      }
    }, 350);
  };

  const handleCommunityInputChange = (e) => {
    const value = e.target.value;
    setForm({ ...form, community: value });
    searchCommunitiesThrottled(value);
  };

  const handleSuggestionClick = (communityName) => {
    setForm({ ...form, community: communityName });
    setShowSuggestions(false);
    setCommunitySuggestions([]);
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
                <div className="modal-field" style={{ position: 'relative' }}>
                  <label className="modal-label">Community</label>
                  <input 
                    className="modal-input" 
                    placeholder="Type to search communities..." 
                    value={form.community} 
                    onChange={handleCommunityInputChange}
                    onFocus={() => {
                      if (form.community.trim() && communitySuggestions.length > 0) {
                        setShowSuggestions(true);
                      }
                    }}
                  />
                  {showSuggestions && communitySuggestions.length > 0 && (
                    <div className="autocomplete-suggestions">
                      {communitySuggestions.map((community) => (
                        <div 
                          key={community.id} 
                          className="autocomplete-item"
                          onClick={() => handleSuggestionClick(community.name)}
                        >
                          {community.name}
                        </div>
                      ))}
                    </div>
                  )}
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
