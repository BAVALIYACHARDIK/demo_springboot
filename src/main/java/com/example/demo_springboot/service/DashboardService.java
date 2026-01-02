package com.example.demo_springboot.service;

import com.example.demo_springboot.model.Comment;
import com.example.demo_springboot.model.Hashtag;
import com.example.demo_springboot.model.Post;
import com.example.demo_springboot.model.User;
import com.example.demo_springboot.repository.CommentRepository;
import com.example.demo_springboot.repository.PostRepository;
import com.example.demo_springboot.repository.HashtagRepository;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class DashboardService {

    private final PostRepository postRepository;
    private final CommentRepository commentRepository;
    private final HashtagRepository hashtagRepository;
    private final com.example.demo_springboot.repository.UserRepository userRepository;

    public DashboardService(PostRepository postRepository, CommentRepository commentRepository,
            HashtagRepository hashtagRepository, com.example.demo_springboot.repository.UserRepository userRepository) {
        this.postRepository = postRepository;
        this.commentRepository = commentRepository;
        this.hashtagRepository = hashtagRepository;
        this.userRepository = userRepository;
    }

    public Map<String, Object> createPost(Map<String, Object> payload) {
        Post post = new Post();
        post.setTitle(String.valueOf(payload.getOrDefault("title", "")));
        post.setBody(String.valueOf(payload.getOrDefault("body", "")));
        // author handling (optional) - validate existence
        Object authorIdObj = payload.get("authorId");
        if (authorIdObj != null) {
            try {
                Long authorId = Long.parseLong(String.valueOf(authorIdObj));
                userRepository.findById(authorId).ifPresent(post::setAuthor);
            } catch (Exception ignored) {
            }
        }

        // hashtags handling (optional) - expect an iterable of ids under 'hashtagIds'
        Object hashtagObj = payload.get("hashtagIds");
        if (hashtagObj instanceof Iterable) {
            List<Long> ids = new ArrayList<>();
            for (Object o : (Iterable<?>) hashtagObj) {
                try {
                    ids.add(Long.parseLong(String.valueOf(o)));
                } catch (Exception ignored) {
                }
            }
            if (!ids.isEmpty()) {
                for (Hashtag h : hashtagRepository.findAllById(ids))
                    post.getHashtags().add(h);
            }
        }

        // support parsing hashtags string like "@one @two"
        Object hashtagsTextObj = payload.get("hashtags");
        if (hashtagsTextObj instanceof String) {
            String text = ((String) hashtagsTextObj).trim();
            if (!text.isEmpty()) {
                java.util.regex.Pattern p = java.util.regex.Pattern.compile("@([A-Za-z0-9_-]+)");
                java.util.regex.Matcher m = p.matcher(text);
                java.util.Set<String> names = new java.util.HashSet<>();
                while (m.find()) {
                    names.add(m.group(1));
                }
                for (String name : names) {
                    Hashtag h = hashtagRepository.findByNameIgnoreCase(name).orElseGet(() -> {
                        try {
                            return hashtagRepository.save(new Hashtag(null, name));
                        } catch (org.springframework.dao.DataIntegrityViolationException ex) {
                            // race: another thread inserted the tag; try fetch again
                            return hashtagRepository.findByNameIgnoreCase(name).orElse(null);
                        }
                    });
                    if (h != null)
                        post.getHashtags().add(h);
                }
            }
        }

        Post saved = postRepository.save(post);
        return mapPost(saved);
    }

    public List<Map<String, Object>> search(String q) {
        if (q == null || q.trim().isEmpty())
            return getAllPosts();
        List<Post> found = postRepository.findByTitleContainingIgnoreCaseOrBodyContainingIgnoreCase(q, q);
        List<Map<String, Object>> out = new ArrayList<>();
        for (Post p : found)
            out.add(mapPost(p));
        return out;
    }

    public List<Map<String, Object>> getAllPosts() {
        List<Map<String, Object>> out = new ArrayList<>();
        for (Post p : postRepository.findAll())
            out.add(mapPost(p));
        return out;
    }

    public Map<String, Object> getPost(Long id) {
        return postRepository.findById(id).map(this::mapPost).orElse(null);
    }

    public List<Map<String, Object>> getPostComments(Long id) {
        // Return only top-level comments for the post (where parent is NULL).
        // If the post doesn't exist, return null so controller can map to 404.
        if (!postRepository.existsById(id))
            return null;
        List<Map<String, Object>> out = new ArrayList<>();
        for (Comment c : commentRepository.findByPostIdAndParentIsNull(id))
            out.add(mapComment(c));
        return out;
    }

    /**
     * Return direct children (one level) of the given comment id.
     * Returns null if the parent comment does not exist (controller maps to 404).
     */
    public List<Map<String, Object>> getCommentChildren(Long commentId) {
        if (!commentRepository.existsById(commentId))
            return null;
        List<Map<String, Object>> out = new ArrayList<>();
        for (Comment c : commentRepository.findByParentId(commentId))
            out.add(mapComment(c));
        return out;
    }

    public Map<String, Object> createComment(Map<String, Object> payload) {
        Object postIdObj = payload.get("postId");
        if (postIdObj == null)
            throw new IllegalArgumentException("postId is required");
        long pId;
        try {
            pId = Long.parseLong(String.valueOf(postIdObj));
        } catch (Exception e) {
            throw new IllegalArgumentException("invalid postId");
        }

        Post post = postRepository.findById(pId).orElseThrow(() -> new IllegalArgumentException("post not found"));

        Comment comment = new Comment();
        comment.setBody(String.valueOf(payload.getOrDefault("body", "")));
        comment.setPost(post);

        // Set author (User reference)
        Object authorIdObj = payload.get("authorId");
        if (authorIdObj != null) {
            try {
                Long authorId = Long.parseLong(String.valueOf(authorIdObj));
                userRepository.findById(authorId).ifPresent(comment::setAuthor);
            } catch (Exception ignored) {
            }
        }

        // Set parent comment (for nested replies)
        Object parentIdObj = payload.get("parentId");
        if (parentIdObj != null) {
            try {
                Long parentId = Long.parseLong(String.valueOf(parentIdObj));
                commentRepository.findById(parentId).ifPresent(comment::setParent);
            } catch (Exception ignored) {
            }
        }

        Comment saved = commentRepository.save(comment);
        return mapComment(saved);
    }

    private Map<String, Object> mapPost(Post p) {
        Map<String, Object> m = new HashMap<>();
        m.put("id", p.getId());
        m.put("title", p.getTitle());
        m.put("body", p.getBody());
        m.put("createdAt", p.getCreatedAt() == null ? null : p.getCreatedAt().toString());

        // Include author details
        if (p.getAuthor() != null) {
            Map<String, Object> authorMap = new HashMap<>();
            authorMap.put("id", p.getAuthor().getId());
            authorMap.put("name", p.getAuthor().getName());
            m.put("author", authorMap);
        } else {
            m.put("author", null);
        }

        List<Map<String, Object>> tags = new ArrayList<>();
        for (Hashtag h : p.getHashtags())
            tags.add(Map.of("id", h.getId(), "name", h.getName()));
        m.put("hashtags", tags);
        return m;
    }

    private Map<String, Object> mapComment(Comment c) {
        Map<String, Object> m = new HashMap<>();
        m.put("id", c.getId());
        m.put("postId", c.getPost() == null ? null : c.getPost().getId());
        m.put("parentId", c.getParent() == null ? null : c.getParent().getId());
        m.put("body", c.getBody());
        m.put("createdAt", c.getCreatedAt() == null ? null : c.getCreatedAt().toString());

        // Include author details
        if (c.getAuthor() != null) {
            Map<String, Object> authorMap = new HashMap<>();
            authorMap.put("id", c.getAuthor().getId());
            authorMap.put("name", c.getAuthor().getName());
            m.put("author", authorMap);
        } else {
            m.put("author", null);
        }

        // Include reply count instead of all replies for performance
        int replyCount = c.getReplies() != null ? c.getReplies().size() : 0;
        m.put("replyCount", replyCount);

        return m;
    }
}
