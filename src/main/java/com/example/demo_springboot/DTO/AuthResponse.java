package com.example.demo_springboot.DTO;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private String name;
    private String email;
    private String role;
    private String message;

    public AuthResponse(String message) {
        this.message = message;
    }
}