package com.edusim.controller;

import com.edusim.dto.RegisterRequest;
import com.edusim.entity.User;
import com.edusim.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import com.edusim.dto.LoginRequest;
import com.edusim.dto.UserResponse;
import com.edusim.dto.LoginResponse;
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public UserResponse register(@RequestBody RegisterRequest request) {
        return authService.register(request);
    }
 @PostMapping("/login")
public LoginResponse login(@RequestBody LoginRequest request) {
    return authService.login(request);
}
}