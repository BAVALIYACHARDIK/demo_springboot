package com.example.demo_springboot.DTO;

import lombok.*;
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginRequest {
    private String email;
    private String password;
    private String role;
}

