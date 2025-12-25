package com.example.demo_springboot.config;

import com.example.demo_springboot.service.AuthService;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import javax.crypto.SecretKey;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Collections;
import java.util.Date;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private AuthService authService;


    private  String SECRET_STRING ;
    private  SecretKey SECRET_KEY;

    public JwtAuthenticationFilter(AuthService authService,@Value("${jwt.secret}") String secretString) {
        this.authService = authService;
        byte[] keyBytes = Decoders.BASE64.decode(secretString);
        this.SECRET_KEY = Keys.hmacShaKeyFor(keyBytes);
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");
        final String path = request.getServletPath();

        // Skip filter if no token is present
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String jwt = authHeader.substring(7);

        try {
            if (path.startsWith("/api/admin")) {
                // --- CASE 1: ADMIN VALIDATION ---
                // We call your existing function here
                ResponseEntity<Map<String, String>> adminResponse = authService.validateAdminToken(jwt);

                // For logic demonstration, I'll assume it returns 200 OK if valid:
                 // Replace with: adminResponse.getStatusCode() == HttpStatus.OK;

                if (adminResponse.getStatusCode()== HttpStatus.OK) {
                    setAuthentication(request, jwt, "admin");
                }
                else{
                    response.setStatus(adminResponse.getStatusCode().value());
                    response.setContentType("application/json");
                    assert adminResponse.getBody() != null;
                    response.getWriter().write("{\"error\": \"" + adminResponse.getBody().get("message") + "\"}");
                    return;
                }

            } else {
                // --- CASE 2: NORMAL VALIDATION ---
                Claims claims = Jwts.parser()
                        .verifyWith(SECRET_KEY)
                        .build()
                        .parseSignedClaims(jwt)
                        .getPayload();

                if (claims.getExpiration().after(new Date())) {
                    setAuthentication(request, jwt, "ROLE_USER");
                }
            }
        } catch (Exception e) {
            // Token is invalid or expired
            SecurityContextHolder.clearContext();
        }

        filterChain.doFilter(request, response);
    }


    private void setAuthentication(HttpServletRequest request, String jwt, String role) {
        // Extract username/email from token
        String username = Jwts.parser()
                .verifyWith(SECRET_KEY)
                .build()
                .parseSignedClaims(jwt)
                .getPayload()
                .getSubject();

        UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                username,
                null,
                Collections.singletonList(new SimpleGrantedAuthority(role))
        );
        authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
        SecurityContextHolder.getContext().setAuthentication(authToken);
    }

    private SecretKey getSignInKey() {
        byte[] keyBytes = Decoders.BASE64.decode(SECRET_STRING);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}