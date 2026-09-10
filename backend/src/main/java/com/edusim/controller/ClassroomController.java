package com.edusim.controller;

import com.edusim.dto.ClassroomRequest;
import com.edusim.dto.JoinClassRequest;
import com.edusim.dto.UserResponse;
import com.edusim.entity.Classroom;
import com.edusim.entity.User;
import com.edusim.service.ClassroomService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/classrooms")
@RequiredArgsConstructor
public class ClassroomController {

    private final ClassroomService classroomService;

    @PostMapping
    public Classroom createClassroom(@RequestBody ClassroomRequest request) {
        return classroomService.createClassroom(request);
    }

    @PostMapping("/join")
    public Classroom joinClassroom(@RequestBody JoinClassRequest request) {
        return classroomService.joinClassroom(request);
    }

    @GetMapping("/teacher/{teacherId}")
    public List<Classroom> getClassroomsByTeacher(@PathVariable Long teacherId) {
        return classroomService.getClassroomsByTeacher(teacherId);
    }

    @GetMapping("/student/{studentId}")
    public Classroom getClassroomByStudent(@PathVariable Long studentId) {
        return classroomService.getClassroomByStudent(studentId);
    }

    @GetMapping("/{id}")
    public Classroom getClassroomById(@PathVariable Long id) {
        return classroomService.getClassroomById(id);
    }

    @GetMapping("/{id}/students")
    public List<UserResponse> getClassroomStudents(@PathVariable Long id) {
        Classroom classroom = classroomService.getClassroomById(id);
        return classroom.getStudents().stream()
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

    @PostMapping("/leave")
    public void leaveClassroom() {
        String email = (String) org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        classroomService.leaveClassroom(email);
    }

    @PostMapping("/remove-student")
    public void removeStudent(@RequestParam Long studentId) {
        classroomService.removeStudentFromClassroom(studentId);
    }
}
