package com.example.demo_springboot.service;

import com.example.demo_springboot.DTO.AuthResponse;
import com.example.demo_springboot.DTO.LoginRequest;
import com.example.demo_springboot.DTO.RegisterRequest;
import com.example.demo_springboot.model.User;
import com.example.demo_springboot.repository.UserRepository;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import java.util.Date;
import java.util.Map;
import javax.crypto.SecretKey;

@Service
public class AuthService {
    private final UserRepository userRepository;

    @Value("${jwt.secret}")
    private String jwtSecret;
    @Value("${admin.role}")
    private String admin_role;
    @Value("${admin.pass}")
    private String admin_pass;
    private String role = "user";

    public AuthService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            return new AuthResponse("Email already in use");
        }

        if (request.getName().equals(admin_role) && request.getPassword().equals(admin_pass)) {
            role = "admin";
        }

        User user = new User(null, request.getName(), request.getEmail(), request.getPassword(), role);
        User savedUser = userRepository.save(user);
        String token = generateToken(String.valueOf(savedUser.getId()), savedUser.getRole());

        return new AuthResponse(
                token,
                savedUser.getName(),
                savedUser.getEmail(),
                savedUser.getRole(),
                "registration successful");
    }

    public AuthResponse login(LoginRequest request) {
        var userOpt = userRepository.findByEmail(request.getEmail());
        if (userOpt.isEmpty()) {
            return new AuthResponse("Invalid credentials");
        }
        User user = userOpt.get();
        if (!user.getPassword().equals(request.getPassword())) {
            return new AuthResponse("Invalid credentials");
        }
        String token = generateToken(String.valueOf(user.getId()), user.getRole());
        return new AuthResponse(
                token,
                user.getName(),
                user.getEmail(),
                user.getRole(),
                "login successful");
    }

    public ResponseEntity<Map<String, String>> validateAdminToken(String token) {
        try {
            Claims claims = Jwts.parser()
                    .verifyWith(getSignInKey())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();

            String role = claims.get("role", String.class);

            if ("admin".equals(role)) {
                return ResponseEntity.ok(Map.of("message", "Authorized"));
            } else {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(Map.of("message", "Access Denied: Admin role required"));
            }

        } catch (ExpiredJwtException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Session Expired"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Invalid Token"));
        }
    }

    private String generateToken(String subject, String role) {
        Date now = new Date();
        // 1 hour expiry (milliseconds)
        Date expiryDate = new Date(now.getTime() + 60L * 60L * 10000L);
        return Jwts.builder()
                .subject(subject)
                .claim("role", role)
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(getSignInKey())
                .compact();
    }

    private SecretKey getSignInKey() {
        byte[] keyBytes = Decoders.BASE64.decode(jwtSecret);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    // public ResponseEntity<Map<String, Object>> decodeToken(String token) {
    // try {
    // Claims claims = Jwts.parser()
    // .verifyWith(getSignInKey())
    // .build()
    // .parseSignedClaims(token)
    // .getPayload();
    // Map<String, Object> out = new HashMap<>();
    // out.put("sub", claims.getSubject());
    // out.put("role", claims.get("role", String.class));
    // out.put("exp", claims.getExpiration());
    // return ResponseEntity.ok(out);
    // } catch (Exception e) {
    // return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error",
    // "Invalid token"));
    // }
    // }
}
