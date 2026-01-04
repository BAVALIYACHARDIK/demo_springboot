import React, { useState, useEffect, useRef } from 'react';
import API from '../services/Dashboardapi';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export function Navbar({ query, setQuery, onSearch, onLogout }) {
  return (
    <header className="bg-[#0F172A] border-b border-[#38BDF8]/20 shadow-lg">
      <div className="max-w-7xl mx-auto px-6 py-3">
        <div className="flex items-center justify-between gap-6">
          <div className="flex items-center gap-4 flex-1">
            <div className="text-base font-bold text-[#38BDF8] tracking-tight">DevCommunity</div>
            <div className="flex-1 max-w-2xl">
              <Input
                aria-label="Search"
                placeholder="Search for posts, communities..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") onSearch(); }}
                className="bg-[#020617] text-[#E5E7EB] border border-[#38BDF8]/30 placeholder:text-[#E5E7EB]/50"
              />
            </div>
          </div>
          <Button className="bg-[#38BDF8] text-[#020617] hover:bg-[#38BDF8]/80" onClick={onLogout}>Log Out</Button>
        </div>
      </div>
    </header>
  );
}

export function LeftSidebar({ joinedCommunities, onCommunityClick }) {
  return (
    <aside className="bg-[#0F172A] border border-[#38BDF8]/20 rounded-lg shadow-lg p-4 sticky top-4">
      <nav className="flex flex-col gap-1 mb-6">
        <a href="#" className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#38BDF8]/20 text-[#38BDF8] font-semibold hover:bg-[#38BDF8]/30 transition-all text-sm">
          <span className="text-base">🏠</span>
          <span>Home</span>
        </a>
        <a href="#" className="flex items-center gap-2 px-3 py-2 rounded-lg text-[#E5E7EB] font-medium hover:bg-[#38BDF8]/10 hover:text-[#38BDF8] transition-all text-sm">
          <span className="text-base">🔥</span>
          <span>Popular</span>
        </a>
        <a href="#" className="flex items-center gap-2 px-3 py-2 rounded-lg text-[#E5E7EB] font-medium hover:bg-[#38BDF8]/10 hover:text-[#38BDF8] transition-all text-sm">
          <span className="text-base">🧭</span>
          <span>Explore</span>
        </a>
      </nav>
      
      {joinedCommunities && joinedCommunities.length > 0 && (
        <div className="mb-6">
          <div className="text-xs font-bold text-[#38BDF8] uppercase tracking-wider mb-2 px-3">MY COMMUNITIES</div>
          <div className="flex flex-col gap-1">
            {joinedCommunities.map((community) => (
              <a 
                href="#" 
                key={community.id} 
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-[#E5E7EB] font-medium hover:bg-[#38BDF8]/10 hover:text-[#38BDF8] transition-all text-sm"
                onClick={(e) => {
                  e.preventDefault();
                  if (onCommunityClick) {
                    onCommunityClick(community.id);
                  }
                }}
              >
                <span className="text-base">👥</span>
                <span>{community.name}</span>
              </a>
            ))}
          </div>
        </div>
      )}

      <div>
        <div className="text-xs font-bold text-[#38BDF8] uppercase tracking-wider mb-2 px-3">RESOURCES</div>
        <div className="flex flex-col gap-1">
          <a href="#" className="flex items-center gap-2 px-3 py-2 rounded-lg text-[#E5E7EB] font-medium hover:bg-[#38BDF8]/10 hover:text-[#38BDF8] transition-all text-sm">
            <span className="text-base">ℹ️</span>
            <span>About</span>
          </a>
          <a href="#" className="flex items-center gap-2 px-3 py-2 rounded-lg text-[#E5E7EB] font-medium hover:bg-[#38BDF8]/10 hover:text-[#38BDF8] transition-all text-sm">
            <span className="text-base">📢</span>
            <span>Advertise</span>
          </a>
          <a href="#" className="flex items-center gap-2 px-3 py-2 rounded-lg text-[#E5E7EB] font-medium hover:bg-[#38BDF8]/10 hover:text-[#38BDF8] transition-all text-sm">
            <span className="text-base">💻</span>
            <span>Developer Platform</span>
          </a>
          <a href="#" className="flex items-center gap-2 px-3 py-2 rounded-lg text-[#E5E7EB] font-medium hover:bg-[#38BDF8]/10 hover:text-[#38BDF8] transition-all text-sm">
            <span className="text-base">❓</span>
            <span>Help</span>
          </a>
        </div>
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
    <aside className="space-y-4">
      <Button className="w-full bg-[#38BDF8] text-[#020617] hover:bg-[#38BDF8]/80" onClick={onAddPost}>
        + Create Post
      </Button>
      
      <Card className="bg-[#0F172A] border border-[#38BDF8]/20 shadow-lg overflow-hidden">
        <CardHeader className="bg-[#38BDF8]/10 p-4 border-b border-[#38BDF8]/20">
          <div className="text-xs font-bold uppercase tracking-wider text-[#38BDF8]">POPULAR COMMUNITIES</div>
        </CardHeader>
        <CardContent className="p-0">
          <div 
            className="max-h-[500px] overflow-y-auto" 
            ref={listRef}
            onScroll={handleScroll}
          >
            {communities.map((community) => (
              <a 
                href="#" 
                key={community.id} 
                className={`flex items-center gap-3 px-4 py-3 transition-all ${
                  selectedCommunityId === community.id ? 'bg-[#38BDF8]/20 text-[#38BDF8] font-semibold border-l-2 border-[#38BDF8]' : 'text-[#E5E7EB] hover:bg-[#38BDF8]/10 hover:text-[#38BDF8]'
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  onCommunityClick(community.id);
                }}
              >
                <div className="flex-1">
                  <div className="font-medium text-sm">{community.name}</div>
                </div>
              </a>
            ))}
            {loading && (
              <div className="text-center py-3 text-xs text-[#E5E7EB]/70">Loading more...</div>
            )}
            {!hasMore && communities.length > 0 && (
              <div className="text-center py-3 text-xs text-[#E5E7EB]/70">No more communities</div>
            )}
          </div>
        </CardContent>
      </Card>
    </aside>
  );
}
