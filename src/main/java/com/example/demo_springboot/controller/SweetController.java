package com.example.demo_springboot.controller;

import com.example.demo_springboot.service.SweetService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.*;

@RestController
@RequestMapping("/api/sweets")
public class SweetController {

    private final SweetService sweetService;

    public SweetController(SweetService sweetService) {
        this.sweetService = sweetService;
    }

    @GetMapping("/get")
    public ResponseEntity<Map<String, Object>> listSweets(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "12") int limit,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice) {
        Map<String, Object> resp = sweetService.listSweets(page, limit, search, category, minPrice, maxPrice);
        return ResponseEntity.ok(resp);
    }

    @PostMapping("/post")
    public ResponseEntity<?> addSweet(@RequestBody Map<String, Object> body) {
        // No validation: accept whatever values are provided and forward to service
        String name = body.get("name") == null ? null : String.valueOf(body.get("name")).trim();
        String category = body.get("category") == null ? null : String.valueOf(body.get("category")).trim();

        Double price = null;
        Object priceObj = body.get("price");
        if (priceObj instanceof Number) {
            price = ((Number) priceObj).doubleValue();
        } else if (priceObj instanceof String) {
            try {
                price = Double.valueOf((String) priceObj);
            } catch (Exception ignored) {
                price = null;
            }
        }

        com.example.demo_springboot.model.Sweet saved = sweetService.addSweet(name, category, price);
        return ResponseEntity.ok(saved);
    }

    // Note: data is provided by SweetRepository; repository starts empty. POST/save
    // methods will be added later.
}
