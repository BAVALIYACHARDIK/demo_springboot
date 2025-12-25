package com.example.demo_springboot.controller;

import com.example.demo_springboot.DTO.LoginRequest;
import com.example.demo_springboot.DTO.RegisterRequest;
import com.example.demo_springboot.DTO.AuthResponse;
import com.example.demo_springboot.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")

public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/validate-admin")
    public ResponseEntity<Map<String, String>> validateAdmin(@RequestBody Map<String, String> request) {
        String token = request.get("token");
        return authService.validateAdminToken(token);
    }
}

