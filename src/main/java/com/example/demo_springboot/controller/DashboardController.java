package com.example.demo_springboot.controller;

import com.example.demo_springboot.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    // POST /api/posts
    @PostMapping("/posts")
    public ResponseEntity<Map<String, Object>> createPost(@RequestBody Map<String, Object> payload) {
        Map<String, Object> post = dashboardService.createPost(payload);
        return ResponseEntity.ok(post);
    }

    // GET /api/search?q=
    @GetMapping("/search")
    public ResponseEntity<List<Map<String, Object>>> search(@RequestParam(defaultValue = "") String q) {
        return ResponseEntity.ok(dashboardService.search(q));
    }

    // GET /api/posts
    @GetMapping("/posts")
    public ResponseEntity<List<Map<String, Object>>> getAllPosts() {
        return ResponseEntity.ok(dashboardService.getAllPosts());
    }

    // GET /api/posts/{id}
    @GetMapping("/posts/{id}")
    public ResponseEntity<?> getPost(@PathVariable Long id) {
        Map<String, Object> post = dashboardService.getPost(id);
        if (post == null)
            return ResponseEntity.notFound().build();
        return ResponseEntity.ok(post);
    }

    // GET /api/posts/{id}/comments
    @GetMapping("/posts/{id}/comments")
    public ResponseEntity<List<Map<String, Object>>> getPostComments(@PathVariable Long id) {
        List<Map<String, Object>> list = dashboardService.getPostComments(id);
        if (list == null)
            return ResponseEntity.notFound().build();
        return ResponseEntity.ok(list);
    }

    // GET /api/comments/{id}/comments -> direct children of a comment (one level)
    @GetMapping("/comments/{id}/comments")
    public ResponseEntity<List<Map<String, Object>>> getCommentChildren(@PathVariable Long id) {
        List<Map<String, Object>> list = dashboardService.getCommentChildren(id);
        if (list == null)
            return ResponseEntity.notFound().build();
        return ResponseEntity.ok(list);
    }

    // POST /api/comments
    @PostMapping("/comments")
    public ResponseEntity<?> createComment(@RequestBody Map<String, Object> payload) {
        try {
            Map<String, Object> comment = dashboardService.createComment(payload);
            return ResponseEntity.ok(comment);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
