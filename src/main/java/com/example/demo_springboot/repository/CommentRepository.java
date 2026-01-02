package com.example.demo_springboot.repository;

import com.example.demo_springboot.model.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    /**
     * All comments for a post (including nested replies).
     */
    List<Comment> findByPostId(Long postId);

    /**
     * Top-level comments whose parent is NULL for the given post.
     */
    List<Comment> findByPostIdAndParentIsNull(Long postId);

    /**
     * Direct children of a given comment (one level deep only).
     */
    List<Comment> findByParentId(Long parentId);
}
