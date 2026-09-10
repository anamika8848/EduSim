package com.edusim.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

import com.edusim.service.JwtService;
import com.edusim.repository.UserRepository;
import com.edusim.entity.User;
import lombok.RequiredArgsConstructor;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Collections;
import java.util.List;
import java.util.Optional;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserRepository userRepository;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        System.out.println("[JwtAuthFilter] Request URI: " + request.getMethod() + " " + request.getRequestURI());

        String authHeader = request.getHeader("Authorization");

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            System.out.println("[JwtAuthFilter] Bearer token found. Validating token...");

            if (jwtService.isTokenValid(token)) {
                String email = jwtService.extractEmail(token);
                String role = jwtService.extractRole(token);
                System.out.println("[JwtAuthFilter] Valid token for email: " + email + ", Extracted Claim Role: " + role);

                if (role == null && email != null) {
                    // Fallback to database lookup if the token doesn't have the role claim (for old sessions)
                    Optional<User> userOpt = userRepository.findByEmail(email);
                    if (userOpt.isPresent()) {
                        role = userOpt.get().getRole().name();
                        System.out.println("[JwtAuthFilter] DB Fallback resolved role: " + role);
                    } else {
                        System.out.println("[JwtAuthFilter] DB Fallback failed: User not found in DB for email " + email);
                    }
                }

                List<SimpleGrantedAuthority> authorities = Collections.emptyList();
                if (role != null) {
                    authorities = List.of(new SimpleGrantedAuthority("ROLE_" + role));
                }

                UsernamePasswordAuthenticationToken auth =
                        new UsernamePasswordAuthenticationToken(
                                email,
                                null,
                                authorities
                        );

                SecurityContextHolder.getContext().setAuthentication(auth);
                System.out.println("[JwtAuthFilter] Authenticated Principal: " + email + " with Authorities: " + authorities);
            } else {
                System.out.println("[JwtAuthFilter] Token is INVALID.");
            }
        } else {
            System.out.println("[JwtAuthFilter] No Bearer token found in headers.");
        }

        filterChain.doFilter(request, response);
    }
}