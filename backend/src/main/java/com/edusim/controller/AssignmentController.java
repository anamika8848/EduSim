package com.edusim.controller;

import com.edusim.dto.AssignmentRequest;
import com.edusim.entity.Assignment;
import com.edusim.service.AssignmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import com.edusim.dto.GradeRequest;

import com.edusim.dto.DashboardStats;
@RestController
@RequestMapping("/api/assignments")
@RequiredArgsConstructor
public class AssignmentController {

    private final AssignmentService assignmentService;

    @PostMapping
    public List<Assignment> createAssignment(
            @RequestBody AssignmentRequest request
    ) {
        if (request.getClassroomId() == null) {
            throw new RuntimeException("Classroom ID is required to create an assignment.");
        }
        return assignmentService.createAssignmentForClass(request);
    }
    @GetMapping("/{id}")
    public Assignment getAssignmentById(@PathVariable Long id) {
        return assignmentService.getAssignmentById(id);
    }
    @GetMapping("/student/{studentId}")
public List<Assignment> getStudentAssignments(
        @PathVariable Long studentId
) {
    return assignmentService.getAssignmentsByStudentId(studentId);
}
@PutMapping("/{id}/complete")
public Assignment completeAssignment(
        @PathVariable Long id,
        @RequestBody(required = false) com.edusim.dto.LabReportRequest request
) {
    return assignmentService.markAsCompleted(id, request);
}
@PutMapping("/{id}/draft")
public Assignment saveDraft(
        @PathVariable Long id,
        @RequestBody(required = false) com.edusim.dto.LabReportRequest request
) {
    return assignmentService.saveDraft(id, request);
}
@GetMapping("/teacher/{teacherId}")
public List<Assignment> getTeacherAssignments(
        @PathVariable Long teacherId
) {
    return assignmentService.getAssignmentsByTeacherId(teacherId);
}
@PutMapping("/{id}/grade")
public Assignment gradeAssignment(
        @PathVariable Long id,
        @RequestBody GradeRequest request
) {
    return assignmentService.gradeAssignment(id, request);
}
@GetMapping("/student/{studentId}/stats")
public DashboardStats getStudentStats(
        @PathVariable Long studentId
) {
    return assignmentService.getStudentStats(studentId);
}
@GetMapping("/teacher/{teacherId}/stats")
public DashboardStats getTeacherStats(
        @PathVariable Long teacherId
) {
    return assignmentService.getTeacherStats(teacherId);
}
}