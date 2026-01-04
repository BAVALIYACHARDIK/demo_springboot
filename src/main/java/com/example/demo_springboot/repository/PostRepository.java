package com.example.demo_springboot.repository;

import com.example.demo_springboot.model.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {
    @Query("SELECT p FROM Post p ORDER BY p.createdAt DESC")
    List<Post> findAllOrderByCreatedAtDesc();

    @Query("SELECT p FROM Post p WHERE p.title ILIKE %:q% OR p.body ILIKE %:q% ORDER BY p.createdAt DESC")
    List<Post> findByTitleContainingIgnoreCaseOrBodyContainingIgnoreCaseOrderByCreatedAtDesc(String q);

    @Query("SELECT p FROM Post p WHERE p.community.id = :communityId ORDER BY p.createdAt DESC")
    List<Post> findByCommunityIdOrderByCreatedAtDesc(Long communityId);
}
