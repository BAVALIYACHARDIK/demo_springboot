package com.example.demo_springboot.repository;

import com.example.demo_springboot.model.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {
    List<Post> findByTitleContainingIgnoreCaseOrBodyContainingIgnoreCase(String title, String body);

    List<Post> findByCommunityId(Long communityId);
}
