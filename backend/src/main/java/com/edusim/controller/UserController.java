package com.edusim.controller;

import com.edusim.dto.UserResponse;
import com.edusim.entity.Role;
import com.edusim.entity.User;
import com.edusim.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;

    @GetMapping("/profile")
    public UserResponse getProfile(java.security.Principal principal) {
        if (principal == null) {
            throw new RuntimeException("Unauthorized");
        }
        User user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return mapToResponse(user);
    }

    /**
     * Returns all users with STUDENT role.
     * Used by teachers to select a student when creating an assignment.
     * NEW endpoint - does not modify any existing endpoint.
     */
    @GetMapping("/students")
    public List<UserResponse> getAllStudents() {
        return userRepository.findAll()
                .stream()
                .filter(u -> u.getRole() == Role.STUDENT)
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Returns all users with TEACHER role.
     */
    @GetMapping("/teachers")
    public List<UserResponse> getAllTeachers() {
        return userRepository.findAll()
                .stream()
                .filter(u -> u.getRole() == Role.TEACHER)
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private UserResponse mapToResponse(User user) {
        UserResponse response = new UserResponse();
        response.setId(user.getId());
        response.setFullName(user.getFullName());
        response.setEmail(user.getEmail());
        response.setRole(user.getRole());
        if (user.getClassroom() != null) {
            response.setClassroomId(user.getClassroom().getId());
            response.setClassName(user.getClassroom().getClassName());
            response.setClassCode(user.getClassroom().getClassCode());
        }
        return response;
    }
}
