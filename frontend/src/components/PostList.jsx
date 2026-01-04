import React from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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
    <div className="flex flex-col gap-4">
      {results.map((r) => (
        <Card key={r.id} className="bg-[#0F172A] border border-[#38BDF8]/20 shadow-md hover:shadow-xl hover:border-[#38BDF8]/40 cursor-pointer transition-all duration-300 hover:scale-[1.01]" onClick={() => onPostClick(r.id)}>
          <CardContent className="p-4">
            <div className="flex flex-col gap-2">
              {r.community && (
                <div className="inline-flex items-center gap-2">
                  <Badge variant="outline" className="text-xs font-bold text-[#22D3EE] border border-[#22D3EE]/30 bg-[#22D3EE]/10">c/{r.community.name}</Badge>
                </div>
              )}
              <div className="flex items-center gap-2 text-xs text-[#E5E7EB]/70">
                <span className="font-medium">Posted by {r.author?.name || 'Anonymous'}</span>
                <span>•</span>
                <span>{r.createdAt ? new Date(r.createdAt).toLocaleString() : 'Just now'}</span>
              </div>
              
              <h3 className="text-sm font-bold text-[#E5E7EB] hover:text-[#38BDF8] transition-colors leading-tight">{r.title}</h3>
              
              <div className="flex gap-2 flex-wrap">
                {r.flag && (
                  <Badge className="bg-[#38BDF8] text-[#020617] hover:bg-[#38BDF8]/80">{getFlagIcon(r.flag.name)} {r.flag.name}</Badge>
                )}
              </div>
              
              <div className="text-[#E5E7EB]/80 text-sm leading-relaxed line-clamp-3">{r.body}</div>
              
              <div className="flex gap-3 mt-2">
                <Button size="sm" variant="secondary" className="bg-[#38BDF8]/10 text-[#38BDF8] border border-[#38BDF8]/30 hover:bg-[#38BDF8]/20 h-8" onClick={(e) => e.stopPropagation()}>💬 {r.commentCount ?? 0} Comments</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
