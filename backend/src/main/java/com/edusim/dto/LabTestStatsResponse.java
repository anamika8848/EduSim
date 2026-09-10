package com.edusim.dto;

public class LabTestStatsResponse {

    private Integer totalAssigned;
    private Integer startedCount;
    private Integer inProgressCount;
    private Integer submittedCount;
    private Integer evaluatedCount;
    private Integer absentCount;
    private Double averageTimeMinutes;
    private Double averageWarningCount;
    private Integer totalAutoSubmissions;
    private Double passPercentage;
    private Double failPercentage;
    private Double averageMarks;
    private Integer highestMarks;
    private Integer lowestMarks;

    public Integer getTotalAssigned() {
        return totalAssigned;
    }

    public void setTotalAssigned(Integer totalAssigned) {
        this.totalAssigned = totalAssigned;
    }

    public Integer getStartedCount() {
        return startedCount;
    }

    public void setStartedCount(Integer startedCount) {
        this.startedCount = startedCount;
    }

    public Integer getInProgressCount() {
        return inProgressCount;
    }

    public void setInProgressCount(Integer inProgressCount) {
        this.inProgressCount = inProgressCount;
    }

    public Integer getSubmittedCount() {
        return submittedCount;
    }

    public void setSubmittedCount(Integer submittedCount) {
        this.submittedCount = submittedCount;
    }

    public Integer getEvaluatedCount() {
        return evaluatedCount;
    }

    public void setEvaluatedCount(Integer evaluatedCount) {
        this.evaluatedCount = evaluatedCount;
    }

    public Integer getAbsentCount() {
        return absentCount;
    }

    public void setAbsentCount(Integer absentCount) {
        this.absentCount = absentCount;
    }

    public Double getAverageTimeMinutes() {
        return averageTimeMinutes;
    }

    public void setAverageTimeMinutes(Double averageTimeMinutes) {
        this.averageTimeMinutes = averageTimeMinutes;
    }

    public Double getAverageWarningCount() {
        return averageWarningCount;
    }

    public void setAverageWarningCount(Double averageWarningCount) {
        this.averageWarningCount = averageWarningCount;
    }

    public Integer getTotalAutoSubmissions() {
        return totalAutoSubmissions;
    }

    public void setTotalAutoSubmissions(Integer totalAutoSubmissions) {
        this.totalAutoSubmissions = totalAutoSubmissions;
    }

    public Double getPassPercentage() {
        return passPercentage;
    }

    public void setPassPercentage(Double passPercentage) {
        this.passPercentage = passPercentage;
    }

    public Double getFailPercentage() {
        return failPercentage;
    }

    public void setFailPercentage(Double failPercentage) {
        this.failPercentage = failPercentage;
    }

    public Double getAverageMarks() {
        return averageMarks;
    }

    public void setAverageMarks(Double averageMarks) {
        this.averageMarks = averageMarks;
    }

    public Integer getHighestMarks() {
        return highestMarks;
    }

    public void setHighestMarks(Integer highestMarks) {
        this.highestMarks = highestMarks;
    }

    public Integer getLowestMarks() {
        return lowestMarks;
    }

    public void setLowestMarks(Integer lowestMarks) {
        this.lowestMarks = lowestMarks;
    }
}
