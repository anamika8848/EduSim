package com.edusim.service;

import com.edusim.dto.RegisterRequest;
import com.edusim.entity.User;
import com.edusim.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import com.edusim.dto.LoginResponse;
import com.edusim.dto.LoginRequest;
import java.util.Optional;
import com.edusim.dto.UserResponse;
import org.springframework.security.crypto.password.PasswordEncoder;
@Service
@RequiredArgsConstructor
public class AuthService {

    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;
    private final JwtService jwtService;

    public UserResponse register(RegisterRequest request){
        if (com.edusim.entity.Role.ADMIN.equals(request.getRole())) {
            throw new RuntimeException("Public registration of admin accounts is not allowed.");
        }
        User user = new User();
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole());
        User savedUser = userRepository.save(user);
        return mapToResponse(savedUser);
    }
public LoginResponse login(LoginRequest request) {

    Optional<User> user =
            userRepository.findByEmail(request.getEmail());

    if (user.isPresent()
            && passwordEncoder.matches(
                    request.getPassword(),
                    user.get().getPassword())) {

        String token =
                jwtService.generateToken(user.get().getEmail(), user.get().getRole().name());

        return new LoginResponse(token);
    }

    throw new RuntimeException("Invalid email or password");
}
    private UserResponse mapToResponse(User user) {

    UserResponse response = new UserResponse();

    response.setId(user.getId());
    response.setFullName(user.getFullName());
    response.setEmail(user.getEmail());
    response.setRole(user.getRole());

    return response;
}
}