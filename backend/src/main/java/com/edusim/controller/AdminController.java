package com.edusim.controller;

import com.edusim.dto.AdminStatsResponse;
import com.edusim.dto.UserResponse;
import com.edusim.entity.Classroom;
import com.edusim.entity.User;
import com.edusim.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/stats")
    public AdminStatsResponse getStats() {
        return adminService.getStats();
    }

    @GetMapping("/users")
    public List<UserResponse> getAllUsers() {
        return adminService.getAllUsers().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @DeleteMapping("/users/{id}")
    public void deleteUser(@PathVariable Long id) {
        adminService.deleteUser(id);
    }

    @GetMapping("/classrooms")
    public List<Classroom> getAllClassrooms() {
        return adminService.getAllClassrooms();
    }

    @DeleteMapping("/classrooms/{id}")
    public void deleteClassroom(@PathVariable Long id) {
        adminService.deleteClassroom(id);
    }

    @GetMapping("/assignments")
    public List<com.edusim.entity.Assignment> getAllAssignments() {
        return adminService.getAllAssignments();
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
