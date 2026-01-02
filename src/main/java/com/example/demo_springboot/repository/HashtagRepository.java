package com.example.demo_springboot.repository;

import com.example.demo_springboot.model.Hashtag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface HashtagRepository extends JpaRepository<Hashtag, Long> {
    Optional<Hashtag> findByName(String name);

    Optional<Hashtag> findByNameIgnoreCase(String name);
}
