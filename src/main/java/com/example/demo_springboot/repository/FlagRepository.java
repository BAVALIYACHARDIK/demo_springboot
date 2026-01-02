package com.example.demo_springboot.repository;

import com.example.demo_springboot.model.Flag;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface FlagRepository extends JpaRepository<Flag, Long> {
    Optional<Flag> findByNameIgnoreCase(String name);
}
