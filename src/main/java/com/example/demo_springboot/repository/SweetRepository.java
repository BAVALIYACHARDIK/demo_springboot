package com.example.demo_springboot.repository;

import com.example.demo_springboot.model.Sweet;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface SweetRepository extends MongoRepository<Sweet, String> {
    /**
     * Convenience method to save a sweet. Uses the underlying save implementation.
     */
    default Sweet addSweet(Sweet s) {
        return save(s);
    }
}
