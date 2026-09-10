package com.edusim.service;

import com.edusim.dto.AssignmentRequest;
import com.edusim.dto.LabReportRequest;
import com.edusim.entity.Assignment;
import com.edusim.entity.Experiment;
import com.edusim.entity.User;
import com.edusim.entity.Classroom;
import com.edusim.repository.AssignmentRepository;
import com.edusim.repository.ExperimentRepository;
import com.edusim.repository.UserRepository;
import com.edusim.repository.ClassroomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import com.edusim.dto.DashboardStats;
import com.edusim.dto.GradeRequest;
import java.util.List;
import java.util.ArrayList;

@Service
@RequiredArgsConstructor
public class AssignmentService {

    private final AssignmentRepository assignmentRepository;
    private final UserRepository userRepository;
    private final ExperimentRepository experimentRepository;
    private final ClassroomRepository classroomRepository;


    public List<Assignment> createAssignmentForClass(AssignmentRequest request) {
        Classroom classroom = classroomRepository.findById(request.getClassroomId())
                .orElseThrow(() -> new RuntimeException("Classroom not found"));

        User teacher = userRepository.findById(request.getTeacherId())
                .orElseThrow(() -> new RuntimeException("Teacher not found"));

        Experiment experiment = experimentRepository.findById(request.getExperimentId())
                .orElseThrow(() -> new RuntimeException("Experiment not found"));

        List<Assignment> assignments = new ArrayList<>();

        for (User student : classroom.getStudents()) {
            Assignment assignment = new Assignment();
            assignment.setStudent(student);
            assignment.setTeacher(teacher);
            assignment.setExperiment(experiment);
            assignment.setDueDate(request.getDueDate());
            assignment.setStatus("PENDING");
            assignment.setClassroom(classroom);
            assignments.add(assignment);
        }

        return assignmentRepository.saveAll(assignments);
    }

    public List<Assignment> getStudentAssignments(User student) {
        return assignmentRepository.findByStudent(student);
    }

    public List<Assignment> getTeacherAssignments(User teacher) {
        return assignmentRepository.findByTeacher(teacher);
    }
    public Assignment getAssignmentById(Long id) {
        return assignmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Assignment not found"));
    }

    public List<Assignment> getAssignmentsByStudentId(Long studentId) {
    return assignmentRepository.findByStudentId(studentId);
}
public List<Assignment> getAssignmentsByTeacherId(Long teacherId) {
    return assignmentRepository.findByTeacherId(teacherId);
}
public Assignment markAsCompleted(Long assignmentId, LabReportRequest reportRequest) {

    Assignment assignment = assignmentRepository
            .findById(assignmentId)
            .orElseThrow();

    String currentStatus = assignment.getStatus();
    if ("SUBMITTED".equals(currentStatus) || "GRADED".equals(currentStatus) || "COMPLETED".equals(currentStatus)) {
        throw new RuntimeException("Cannot modify a submitted or graded report.");
    }

    assignment.setStatus("SUBMITTED");
    assignment.setCompletionDate(java.time.LocalDate.now());

    if (reportRequest != null) {
        assignment.setObservation(reportRequest.getObservation());
        assignment.setResult(reportRequest.getResult());
        assignment.setConclusion(reportRequest.getConclusion());
        assignment.setNotes(reportRequest.getNotes());
        assignment.setReportData(reportRequest.getReportData());
    }

    return assignmentRepository.save(assignment);
}

public Assignment saveDraft(Long assignmentId, LabReportRequest reportRequest) {
    Assignment assignment = assignmentRepository
            .findById(assignmentId)
            .orElseThrow();

    String currentStatus = assignment.getStatus();
    if ("SUBMITTED".equals(currentStatus) || "GRADED".equals(currentStatus) || "COMPLETED".equals(currentStatus)) {
        throw new RuntimeException("Cannot modify a submitted or graded report.");
    }

    if (reportRequest != null) {
        assignment.setObservation(reportRequest.getObservation());
        assignment.setResult(reportRequest.getResult());
        assignment.setConclusion(reportRequest.getConclusion());
        assignment.setNotes(reportRequest.getNotes());
        assignment.setReportData(reportRequest.getReportData());
    }

    return assignmentRepository.save(assignment);
}
public Assignment gradeAssignment(
        Long assignmentId,
        GradeRequest request
) {

    Assignment assignment = assignmentRepository
            .findById(assignmentId)
            .orElseThrow();

    assignment.setScore(request.getScore());
    assignment.setRemarks(request.getRemarks());
    assignment.setStatus("GRADED");

    String reportData = assignment.getReportData();
    if (reportData != null && !reportData.trim().isEmpty()) {
        try {
            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            com.fasterxml.jackson.databind.JsonNode rootNode = mapper.readTree(reportData);
            if (rootNode.isObject()) {
                com.fasterxml.jackson.databind.node.ObjectNode objectNode = (com.fasterxml.jackson.databind.node.ObjectNode) rootNode;
                com.fasterxml.jackson.databind.node.ObjectNode evaluationNode = mapper.createObjectNode();
                evaluationNode.put("score", request.getScore());
                evaluationNode.put("remarks", request.getRemarks());
                evaluationNode.put("dateReviewed", java.time.LocalDateTime.now().toString());
                if (assignment.getTeacher() != null) {
                    evaluationNode.put("evaluatedBy", assignment.getTeacher().getFullName());
                    objectNode.put("teacherName", assignment.getTeacher().getFullName());
                }
                
                objectNode.set("evaluation", evaluationNode);
                objectNode.put("isDraft", false);
                
                assignment.setReportData(mapper.writeValueAsString(objectNode));
            }
        } catch (Exception e) {
            System.err.println("Error updating reportData JSON on grading: " + e.getMessage());
        }
    }

    return assignmentRepository.save(assignment);
}
public DashboardStats getStudentStats(Long studentId) {

    List<Assignment> assignments =
            assignmentRepository.findByStudentId(studentId);

    DashboardStats stats = new DashboardStats();

    stats.setTotalAssignments(assignments.size());

    long submitted = assignments.stream()
            .filter(a -> "SUBMITTED".equals(a.getStatus()))
            .count();

    long graded = assignments.stream()
            .filter(a -> "GRADED".equals(a.getStatus()))
            .count();

    long pending = assignments.stream()
            .filter(a -> "PENDING".equals(a.getStatus()))
            .count();

    stats.setSubmittedAssignments(submitted);
    stats.setGradedAssignments(graded);
    stats.setPendingAssignments(pending);
    stats.setCompletedAssignments(submitted + graded);

    return stats;
}
public DashboardStats getTeacherStats(Long teacherId) {

    List<Assignment> assignments =
            assignmentRepository.findByTeacherId(teacherId);

    DashboardStats stats = new DashboardStats();

    stats.setTotalAssignments(assignments.size());

    long submitted = assignments.stream()
            .filter(a -> "SUBMITTED".equals(a.getStatus()))
            .count();

    long graded = assignments.stream()
            .filter(a -> "GRADED".equals(a.getStatus()))
            .count();

    long pending = assignments.stream()
            .filter(a -> "PENDING".equals(a.getStatus()))
            .count();

    stats.setSubmittedAssignments(submitted);
    stats.setGradedAssignments(graded);
    stats.setPendingAssignments(pending);
    stats.setCompletedAssignments(submitted + graded);

    return stats;
}
}