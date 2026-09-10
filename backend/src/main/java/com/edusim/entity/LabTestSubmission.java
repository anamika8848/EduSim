package com.edusim.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "lab_test_submissions")
public class LabTestSubmission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "lab_test_id", nullable = false)
    private LabTest labTest;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @Column(nullable = false)
    private String status; // "NOT_STARTED", "IN_PROGRESS", "SUBMITTED", "EVALUATED", "EXPIRED"

    private LocalDateTime startTime;
    private LocalDateTime completionTime;

    @Column(nullable = false)
    private Integer warningsCount = 0;

    @Column(length = 3000)
    private String observation;

    @Column(length = 3000)
    private String calculations;

    @Column(length = 3000)
    private String result;

    @Column(length = 3000)
    private String conclusion;

    @Column(columnDefinition = "LONGTEXT")
    private String reportData; // Stores parameters, trials, and snapshot JSON

    private Integer observationMarks;
    private Integer calculationMarks;
    private Integer conclusionMarks;
    private Integer vivaMarks;
    private Integer totalMarks;

    private String grade;

    @Column(length = 1000)
    private String teacherRemarks;

    @OneToMany(mappedBy = "submission", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonIgnoreProperties("submission")
    private List<LabTestVivaAnswer> vivaAnswers = new ArrayList<>();

    @OneToMany(mappedBy = "submission", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonIgnoreProperties("submission")
    private List<LabTestAuditLog> auditLogs = new ArrayList<>();

    public LabTestSubmission() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LabTest getLabTest() {
        return labTest;
    }

    public void setLabTest(LabTest labTest) {
        this.labTest = labTest;
    }

    public User getStudent() {
        return student;
    }

    public void setStudent(User student) {
        this.student = student;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalDateTime startTime) {
        this.startTime = startTime;
    }

    public LocalDateTime getCompletionTime() {
        return completionTime;
    }

    public void setCompletionTime(LocalDateTime completionTime) {
        this.completionTime = completionTime;
    }

    public Integer getWarningsCount() {
        return warningsCount;
    }

    public void setWarningsCount(Integer warningsCount) {
        this.warningsCount = warningsCount;
    }

    public String getObservation() {
        return observation;
    }

    public void setObservation(String observation) {
        this.observation = observation;
    }

    public String getCalculations() {
        return calculations;
    }

    public void setCalculations(String calculations) {
        this.calculations = calculations;
    }

    public String getResult() {
        return result;
    }

    public void setResult(String result) {
        this.result = result;
    }

    public String getConclusion() {
        return conclusion;
    }

    public void setConclusion(String conclusion) {
        this.conclusion = conclusion;
    }

    public String getReportData() {
        return reportData;
    }

    public void setReportData(String reportData) {
        this.reportData = reportData;
    }

    public Integer getObservationMarks() {
        return observationMarks;
    }

    public void setObservationMarks(Integer observationMarks) {
        this.observationMarks = observationMarks;
    }

    public Integer getCalculationMarks() {
        return calculationMarks;
    }

    public void setCalculationMarks(Integer calculationMarks) {
        this.calculationMarks = calculationMarks;
    }

    public Integer getConclusionMarks() {
        return conclusionMarks;
    }

    public void setConclusionMarks(Integer conclusionMarks) {
        this.conclusionMarks = conclusionMarks;
    }

    public Integer getVivaMarks() {
        return vivaMarks;
    }

    public void setVivaMarks(Integer vivaMarks) {
        this.vivaMarks = vivaMarks;
    }

    public Integer getTotalMarks() {
        return totalMarks;
    }

    public void setTotalMarks(Integer totalMarks) {
        this.totalMarks = totalMarks;
    }

    public String getGrade() {
        return grade;
    }

    public void setGrade(String grade) {
        this.grade = grade;
    }

    public String getTeacherRemarks() {
        return teacherRemarks;
    }

    public void setTeacherRemarks(String teacherRemarks) {
        this.teacherRemarks = teacherRemarks;
    }

    public List<LabTestVivaAnswer> getVivaAnswers() {
        return vivaAnswers;
    }

    public void setVivaAnswers(List<LabTestVivaAnswer> vivaAnswers) {
        this.vivaAnswers = vivaAnswers;
    }

    public List<LabTestAuditLog> getAuditLogs() {
        return auditLogs;
    }

    public void setAuditLogs(List<LabTestAuditLog> auditLogs) {
        this.auditLogs = auditLogs;
    }
}
