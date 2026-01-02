import React, { useState, useMemo, useEffect } from "react";
import API from "../services/Dashboardapi";
import { useNavigate } from "react-router-dom";
import { Navbar, LeftSidebar, RightSidebar } from "../components/LayoutComponents";
import { PostList } from "../components/PostList";
import { PostDetail } from "../components/PostDetail";

export function Dashboard() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ authorId: "", title: "", hashtags: "", description: "" });
  const [selectedPostId, setSelectedPostId] = useState(null);

  useEffect(() => {
    // load initial posts
    (async () => {
      try {
        const res = await API.getAllPosts();
        setResults(Array.isArray(res) ? res : []);
      } catch (e) {
        console.error("Failed to load posts", e);
        setResults([]);
      }
    })();
  }, []);

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

  const openModal = () => setShowModal(true);
  const closeModal = () => {
    setShowModal(false);
    setForm({ authorId: "", title: "", hashtags: "", description: "" });
  };

  const submitPost = async () => {
    const payload = {
      title: form.title,
      body: form.description,
    };
    const uid = localStorage.getItem('user_id');
    if (uid) payload.authorId = Number(uid);
    if (form.hashtags) payload.hashtags = form.hashtags;
    try {
      await API.createPost(payload);
      const res = await API.getAllPosts();
      setResults(Array.isArray(res) ? res : []);
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
              
              {results.length === 0 ? (
                <div className="no-posts">{query ? 'No results found.' : 'No posts yet. Create your first post!'}</div>
              ) : (
                <PostList results={results} onPostClick={handlePostClick} />
              )}
            </>
          )}
        </main>
        
        <RightSidebar onAddPost={openModal} />
      </div>

      {showModal && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal">
            <h3>New Post</h3>
            <div className="modal-body">
              <div className="modal-field">
                <input className="modal-input" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </div>

              <div className="modal-field">
                <input className="modal-input" placeholder="Hashtags (e.g. @one @two)" value={form.hashtags} onChange={(e) => setForm({ ...form, hashtags: e.target.value })} />
              </div>

              <div className="modal-field">
                <textarea className="modal-textarea" placeholder="Description" rows={6} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
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
