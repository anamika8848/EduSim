package com.edusim.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .requestMatchers("/api/auth/**", "/error").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/experiments", "/api/experiments/**").permitAll()
                
                // Admin specific paths
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                
                // Teacher specific exam & question mappings
                .requestMatchers("/api/lab-tests/teacher/**").hasRole("TEACHER")
                .requestMatchers(HttpMethod.POST, "/api/lab-tests").hasRole("TEACHER")
                .requestMatchers(HttpMethod.PUT, "/api/lab-tests/*/state").hasRole("TEACHER")
                .requestMatchers(HttpMethod.PUT, "/api/lab-tests/{id}").hasRole("TEACHER")
                .requestMatchers(HttpMethod.DELETE, "/api/lab-tests/{id}").hasRole("TEACHER")
                .requestMatchers(HttpMethod.PUT, "/api/lab-tests/submissions/*/evaluate").hasRole("TEACHER")
                .requestMatchers("/api/lab-tests/submissions/test/**").hasRole("TEACHER")
                .requestMatchers("/api/lab-tests/*/stats").hasRole("TEACHER")
                
                .requestMatchers(HttpMethod.POST, "/api/experiments/*/viva-questions").hasRole("TEACHER")
                .requestMatchers(HttpMethod.PUT, "/api/experiments/viva-questions/**").hasRole("TEACHER")
                .requestMatchers(HttpMethod.DELETE, "/api/experiments/viva-questions/**").hasRole("TEACHER")
                
                // Student specific exam mappings
                .requestMatchers("/api/lab-tests/student/**").hasRole("STUDENT")
                .requestMatchers(HttpMethod.POST, "/api/lab-tests/*/submissions/start").hasRole("STUDENT")
                .requestMatchers(HttpMethod.PUT, "/api/lab-tests/submissions/*/autosave").hasRole("STUDENT")
                .requestMatchers(HttpMethod.PUT, "/api/lab-tests/submissions/*/submit").hasRole("STUDENT")
                
                .anyRequest().authenticated()
            )
            .addFilterBefore(
                jwtAuthFilter,
                UsernamePasswordAuthenticationFilter.class
            );

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of(
            "http://localhost:5173",
            "http://localhost:3000",
            "http://127.0.0.1:5173"
        ));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "Accept"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}