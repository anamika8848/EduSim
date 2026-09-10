package com.edusim.service;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.springframework.stereotype.Service;

import java.util.Date;

@Service
public class JwtService {

    private static final String SECRET_KEY =
            "edusim-secret-key-edusim-secret-key-2026";

    public String generateToken(String email) {
        return generateToken(email, "USER");
    }

    public String generateToken(String email, String role) {
        return Jwts.builder()
                .subject(email)
                .claim("role", role)
                .issuedAt(new Date())
                .expiration(
                        new Date(System.currentTimeMillis() + 86400000)
                )
                .signWith(
                        io.jsonwebtoken.security.Keys.hmacShaKeyFor(
                                SECRET_KEY.getBytes()
                        ),
                        Jwts.SIG.HS256
                )
                .compact();
    }
    public String extractEmail(String token) {

    return Jwts.parser()
            .verifyWith(
                    io.jsonwebtoken.security.Keys.hmacShaKeyFor(
                            SECRET_KEY.getBytes()
                    )
            )
            .build()
            .parseSignedClaims(token)
            .getPayload()
            .getSubject();
}
    public String extractRole(String token) {
        try {
            return Jwts.parser()
                    .verifyWith(
                            io.jsonwebtoken.security.Keys.hmacShaKeyFor(
                                    SECRET_KEY.getBytes()
                            )
                    )
                    .build()
                    .parseSignedClaims(token)
                    .getPayload()
                    .get("role", String.class);
        } catch (Exception e) {
            return null;
        }
    }

    public boolean isTokenValid(String token) {
        try {
            extractEmail(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}