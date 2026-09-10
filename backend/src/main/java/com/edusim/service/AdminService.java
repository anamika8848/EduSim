package com.edusim.service;

import com.edusim.dto.AdminStatsResponse;
import com.edusim.entity.*;
import com.edusim.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final ClassroomRepository classroomRepository;
    private final AssignmentRepository assignmentRepository;
    private final ExperimentRepository experimentRepository;
    private final AnnouncementRepository announcementRepository;

    public AdminStatsResponse getStats() {
        AdminStatsResponse response = new AdminStatsResponse();

        response.setTotalUsers(userRepository.count());
        response.setTotalStudents(userRepository.countByRole(Role.STUDENT));
        response.setTotalTeachers(userRepository.countByRole(Role.TEACHER));
        response.setTotalClasses(classroomRepository.count());
        response.setTotalAssignments(assignmentRepository.count());
        response.setTotalExperiments(experimentRepository.count());

        // 1. User Growth: group users by registrationDate
        List<User> allUsers = userRepository.findAll();
        Map<LocalDate, Long> growthMap = allUsers.stream()
                .filter(u -> u.getRegistrationDate() != null)
                .collect(Collectors.groupingBy(User::getRegistrationDate, Collectors.counting()));
        
        List<Map<String, Object>> userGrowthList = new ArrayList<>();
        growthMap.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .forEach(entry -> {
                    Map<String, Object> point = new HashMap<>();
                    point.put("date", entry.getKey().toString());
                    point.put("count", entry.getValue());
                    userGrowthList.add(point);
                });
        response.setUserGrowth(userGrowthList);

        // 2. Class Statistics: student counts per classroom
        List<Classroom> allClassrooms = classroomRepository.findAll();
        List<Map<String, Object>> classStatsList = allClassrooms.stream()
                .map(c -> {
                    Map<String, Object> stat = new HashMap<>();
                    stat.put("className", c.getClassName());
                    stat.put("studentCount", (long) c.getStudents().size());
                    return stat;
                })
                .collect(Collectors.toList());
        response.setClassStatistics(classStatsList);

        // 3. Subject Distribution: experiments per subject
        List<Experiment> allExperiments = experimentRepository.findAll();
        Map<Subject, Long> subjectMap = allExperiments.stream()
                .filter(e -> e.getSubject() != null)
                .collect(Collectors.groupingBy(Experiment::getSubject, Collectors.counting()));
        
        List<Map<String, Object>> subjectList = new ArrayList<>();
        subjectMap.forEach((subject, count) -> {
            Map<String, Object> stat = new HashMap<>();
            stat.put("subject", subject.toString());
            stat.put("count", count);
            subjectList.add(stat);
        });
        response.setSubjectDistribution(subjectList);

        // 4. Assignment Completion Rate
        List<Assignment> allAssignments = assignmentRepository.findAll();
        long completed = allAssignments.stream()
                .filter(a -> "SUBMITTED".equals(a.getStatus()) || "GRADED".equals(a.getStatus()))
                .count();
        long pending = allAssignments.size() - completed;

        Map<String, Long> completionRate = new HashMap<>();
        completionRate.put("Completed", completed);
        completionRate.put("Pending", pending);
        response.setAssignmentCompletionRate(completionRate);

        return response;
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Transactional
    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getRole() == Role.ADMIN) {
            long adminCount = userRepository.findAll().stream().filter(u -> u.getRole() == Role.ADMIN).count();
            if (adminCount <= 1) {
                throw new RuntimeException("Cannot delete the only remaining admin user");
            }
        }

        // Delete dependencies first
        if (user.getRole() == Role.TEACHER) {
            // Delete teacher's announcements
            List<Announcement> announcements = announcementRepository.findAll().stream()
                    .filter(a -> a.getTeacher().getId().equals(userId))
                    .collect(Collectors.toList());
            announcementRepository.deleteAll(announcements);

            // Delete teacher's assignments
            List<Assignment> assignments = assignmentRepository.findByTeacherId(userId);
            assignmentRepository.deleteAll(assignments);

            // Delete teacher's classrooms
            List<Classroom> classrooms = classroomRepository.findByTeacherId(userId);
            for (Classroom c : classrooms) {
                // Clear student references
                c.getStudents().forEach(s -> s.setClassroom(null));
                classroomRepository.delete(c);
            }
        } else if (user.getRole() == Role.STUDENT) {
            // Delete student's assignments
            List<Assignment> assignments = assignmentRepository.findByStudentId(userId);
            assignmentRepository.deleteAll(assignments);
        }

        userRepository.delete(user);
    }

    public List<Classroom> getAllClassrooms() {
        return classroomRepository.findAll();
    }

    @Transactional
    public void deleteClassroom(Long classId) {
        Classroom classroom = classroomRepository.findById(classId)
                .orElseThrow(() -> new RuntimeException("Classroom not found"));

        // Delete associated announcements
        List<Announcement> announcements = announcementRepository.findByClassroomIdOrderByCreatedAtDesc(classId);
        announcementRepository.deleteAll(announcements);

        // Delete associated assignments
        List<Assignment> assignments = assignmentRepository.findAll().stream()
                .filter(a -> a.getClassroom() != null && a.getClassroom().getId().equals(classId))
                .collect(Collectors.toList());
        assignmentRepository.deleteAll(assignments);

        // Remove student classroom links
        classroom.getStudents().forEach(s -> s.setClassroom(null));

        classroomRepository.delete(classroom);
    }

    public List<Assignment> getAllAssignments() {
        return assignmentRepository.findAll();
    }
}
