package com.example.demo_springboot.repository;

import com.example.demo_springboot.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;


public interface UserRepository extends MongoRepository<User,String>{
    Optional<User> findByEmail(String email);
    Optional<User> findById(String id);
    boolean existsByEmail(String email);
    boolean existsById(String id);
}
