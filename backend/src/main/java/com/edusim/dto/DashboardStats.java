package com.edusim.dto;

public class DashboardStats {

    private long totalAssignments;
    private long completedAssignments; // Keeps backward compatibility if needed
    private long pendingAssignments;
    private long submittedAssignments;
    private long gradedAssignments;

    public long getTotalAssignments() {
        return totalAssignments;
    }

    public void setTotalAssignments(long totalAssignments) {
        this.totalAssignments = totalAssignments;
    }

    public long getCompletedAssignments() {
        return completedAssignments;
    }

    public void setCompletedAssignments(long completedAssignments) {
        this.completedAssignments = completedAssignments;
    }

    public long getPendingAssignments() {
        return pendingAssignments;
    }

    public void setPendingAssignments(long pendingAssignments) {
        this.pendingAssignments = pendingAssignments;
    }

    public long getSubmittedAssignments() {
        return submittedAssignments;
    }

    public void setSubmittedAssignments(long submittedAssignments) {
        this.submittedAssignments = submittedAssignments;
    }

    public long getGradedAssignments() {
        return gradedAssignments;
    }

    public void setGradedAssignments(long gradedAssignments) {
        this.gradedAssignments = gradedAssignments;
    }
}