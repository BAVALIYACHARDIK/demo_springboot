import React, { useState, useMemo, useEffect, useRef } from "react";
import API from "../services/Dashboardapi";
import { useNavigate } from "react-router-dom";
import { Navbar, LeftSidebar, RightSidebar } from "../components/LayoutComponents";
import { PostList } from "../components/PostList";
import { PostDetail } from "../components/PostDetail";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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
  const [joinedCommunities, setJoinedCommunities] = useState([]);
  const throttleTimerRef = useRef(null);

  // Load joined communities on mount
  useEffect(() => {
    loadJoinedCommunities();
  }, []);

  // Load posts when community filter changes
  useEffect(() => {
    loadPosts(selectedCommunityId);
  }, [selectedCommunityId]);

  const loadJoinedCommunities = async () => {
    try {
      const userId = localStorage.getItem('user_id');
      if (userId) {
        const communities = await API.getUserJoinedCommunities(userId);
        setJoinedCommunities(Array.isArray(communities) ? communities : []);
      }
    } catch (e) {
      console.error("Failed to load joined communities", e);
      setJoinedCommunities([]);
    }
  };

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
    <div className="fixed inset-0 flex flex-col bg-[#020617] overflow-hidden">
      <Navbar query={query} setQuery={setQuery} onSearch={doSearch} onLogout={handleLogout} />
      
      <div className="grid grid-cols-[250px_1fr_320px] gap-4 p-4 w-full flex-1 overflow-hidden lg:grid-cols-[250px_1fr_320px] md:grid-cols-[1fr_320px] sm:grid-cols-1">
        <div className="overflow-y-auto">
          <LeftSidebar 
            joinedCommunities={joinedCommunities} 
            onCommunityClick={handleCommunityClick}
          />
        </div>
        
        <main className="flex flex-col gap-3 overflow-y-auto">
          {selectedPostId ? (
            <PostDetail 
              postId={selectedPostId} 
              onBack={handleBackToList}
              joinedCommunities={joinedCommunities}
              onCommunityJoinToggle={loadJoinedCommunities}
            />
          ) : (
            <>
              <Card className="bg-[#0F172A] shadow-md border border-[#38BDF8]/20">
                <CardContent className="p-3">
                  <div className="flex gap-2">
                    <Badge variant="secondary" className="bg-[#38BDF8] text-[#020617] hover:bg-[#38BDF8]/80 cursor-pointer">🔥 Hot</Badge>
                    <Badge variant="outline" className="bg-[#38BDF8] text-[#020617] border-0 hover:bg-[#38BDF8]/80 cursor-pointer">🆕 New</Badge>
                    <Badge variant="outline" className="bg-[#22D3EE] text-[#020617] border-0 hover:bg-[#22D3EE]/80 cursor-pointer">⬆️ Top</Badge>
                  </div>
                </CardContent>
              </Card>

              {query && <div className="bg-[#0F172A] border border-[#38BDF8]/20 rounded-lg p-3 text-xs text-[#E5E7EB] font-medium">Results for "{query}"</div>}
              
              {selectedCommunityId && (
                <div className="bg-[#0F172A] border border-[#38BDF8]/20 rounded-lg p-3 text-xs text-[#E5E7EB] flex items-center justify-between">
                  <span className="font-semibold">Filtered by community</span>
                  <button className="bg-[#38BDF8] text-[#020617] px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-[#38BDF8]/80 transition-all" onClick={handleClearFilter}>✕ Clear filter</button>
                </div>
              )}
              
              {results.length === 0 ? (
                <div className="bg-[#0F172A] border border-[#38BDF8]/20 rounded-lg shadow-lg py-12 px-6 text-center">
                  <div className="text-3xl mb-3">📭</div>
                  <div className="text-[#E5E7EB] text-sm font-medium">{query ? 'No results found.' : 'No posts yet. Create your first post!'}</div>
                </div>
              ) : (
                <PostList results={results} onPostClick={handlePostClick} />
              )}
            </>
          )}
        </main>
        
        <div className="overflow-y-auto">
          <RightSidebar onAddPost={openModal} onCommunityClick={handleCommunityClick} selectedCommunityId={selectedCommunityId} />
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[1000]" role="dialog" aria-modal="true">
          <div className="w-full max-w-[700px] mx-10 bg-[#0F172A] border border-[#38BDF8]/30 p-6 rounded-lg shadow-2xl">
            <h3 className="m-0 mb-4 text-[#38BDF8] text-base font-bold">Create New Post</h3>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-[#38BDF8]">Title</label>
                <Input className="bg-[#020617] text-[#E5E7EB] border border-[#38BDF8]/30 placeholder:text-[#E5E7EB]/50" placeholder="Enter post title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </div>

              <div className="flex gap-3 w-full">
                <div className="flex flex-col gap-2 relative flex-1">
                  <label className="text-sm font-semibold text-[#FF6B01]">Community</label>
                  <Input 
                    className="bg-[#FF6B01] text-[#353535] border-0 placeholder:text-[#353535] placeholder:opacity-70" 
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
                    <div className="absolute top-full left-0 right-0 bg-[#FF6B01] rounded-lg max-h-[200px] overflow-y-auto z-[1000] shadow-xl mt-2">
                      {communitySuggestions.map((community) => (
                        <div 
                          key={community.id} 
                          className="py-2 px-3 cursor-pointer transition-all text-sm text-[#353535] hover:opacity-80 font-medium"
                          onClick={() => handleSuggestionClick(community.name)}
                        >
                          {community.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2 flex-1">
                  <label className="text-sm font-semibold text-[#FF6B01]">Flag</label>
                  <select className="w-full py-2 px-3 rounded-lg text-sm transition-all focus:outline-none focus:opacity-90 cursor-pointer bg-[#FF6B01] text-[#353535]" value={form.flag} onChange={(e) => setForm({ ...form, flag: e.target.value })}>
                    <option value="">Select a flag...</option>
                    {flags.map((flag) => (
                      <option key={flag.id} value={flag.name}>
                        {getFlagIcon(flag.name)} {flag.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-[#38BDF8]">Description</label>
                <Textarea className="bg-[#020617] text-[#E5E7EB] border border-[#38BDF8]/30 placeholder:text-[#E5E7EB]/50 min-h-[120px]" placeholder="Write your detailed description here..." rows={5} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>

              <div className="flex gap-2 justify-end mt-3">
                <Button variant="secondary" className="bg-[#020617] text-[#E5E7EB] border border-[#38BDF8]/30 hover:bg-[#38BDF8]/10" onClick={closeModal}>Discard</Button>
                <Button className="bg-[#38BDF8] text-[#020617] hover:bg-[#38BDF8]/80" onClick={submitPost}>Post</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
