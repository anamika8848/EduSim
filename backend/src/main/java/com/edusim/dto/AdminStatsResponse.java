package com.edusim.dto;

import java.util.List;
import java.util.Map;

public class AdminStatsResponse {
    private Long totalUsers;
    private Long totalStudents;
    private Long totalTeachers;
    private Long totalClasses;
    private Long totalAssignments;
    private Long totalExperiments;

    private List<Map<String, Object>> userGrowth;
    private List<Map<String, Object>> classStatistics;
    private List<Map<String, Object>> subjectDistribution;
    private Map<String, Long> assignmentCompletionRate;

    public Long getTotalUsers() {
        return totalUsers;
    }

    public void setTotalUsers(Long totalUsers) {
        this.totalUsers = totalUsers;
    }

    public Long getTotalStudents() {
        return totalStudents;
    }

    public void setTotalStudents(Long totalStudents) {
        this.totalStudents = totalStudents;
    }

    public Long getTotalTeachers() {
        return totalTeachers;
    }

    public void setTotalTeachers(Long totalTeachers) {
        this.totalTeachers = totalTeachers;
    }

    public Long getTotalClasses() {
        return totalClasses;
    }

    public void setTotalClasses(Long totalClasses) {
        this.totalClasses = totalClasses;
    }

    public Long getTotalAssignments() {
        return totalAssignments;
    }

    public void setTotalAssignments(Long totalAssignments) {
        this.totalAssignments = totalAssignments;
    }

    public Long getTotalExperiments() {
        return totalExperiments;
    }

    public void setTotalExperiments(Long totalExperiments) {
        this.totalExperiments = totalExperiments;
    }

    public List<Map<String, Object>> getUserGrowth() {
        return userGrowth;
    }

    public void setUserGrowth(List<Map<String, Object>> userGrowth) {
        this.userGrowth = userGrowth;
    }

    public List<Map<String, Object>> getClassStatistics() {
        return classStatistics;
    }

    public void setClassStatistics(List<Map<String, Object>> classStatistics) {
        this.classStatistics = classStatistics;
    }

    public List<Map<String, Object>> getSubjectDistribution() {
        return subjectDistribution;
    }

    public void setSubjectDistribution(List<Map<String, Object>> subjectDistribution) {
        this.subjectDistribution = subjectDistribution;
    }

    public Map<String, Long> getAssignmentCompletionRate() {
        return assignmentCompletionRate;
    }

    public void setAssignmentCompletionRate(Map<String, Long> assignmentCompletionRate) {
        this.assignmentCompletionRate = assignmentCompletionRate;
    }
}
