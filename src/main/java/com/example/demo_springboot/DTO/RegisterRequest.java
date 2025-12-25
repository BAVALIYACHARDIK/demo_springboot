package com.example.demo_springboot.DTO;

import lombok.*;
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {
    private String name;
    private String email;
    private String password;
    private String role;
}
