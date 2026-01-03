package com.example.demo_springboot.repository;

import com.example.demo_springboot.model.Community;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Pageable;

import java.util.Optional;
import java.util.List;

public interface CommunityRepository extends JpaRepository<Community, Long> {
    Optional<Community> findByNameIgnoreCase(String name);

    List<Community> findByNameContainingIgnoreCase(String query, Pageable pageable);
}
