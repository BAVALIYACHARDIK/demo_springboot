package com.example.demo_springboot.repository;

import com.example.demo_springboot.model.Community;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CommunityRepository extends JpaRepository<Community, Long> {
    Optional<Community> findByNameIgnoreCase(String name);
}
