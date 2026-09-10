package com.edusim.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.time.LocalDateTime;

@Entity
@Table(name = "lab_test_audit_logs")
public class LabTestAuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "submission_id", nullable = false)
    @JsonIgnoreProperties({"auditLogs", "vivaAnswers"})
    private LabTestSubmission submission;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    @Column(nullable = false)
    private String eventType; // STARTED, TAB_SWITCH, FULLSCREEN_EXIT, AUTOSAVE, CLOSED, REOPENED, STAGE_CHANGE, SUBMITTED, AUTO_SUBMITTED, ADMIN_FORCE_SUBMIT, ADMIN_ALLOW_REENTRY

    @Column(length = 1000)
    private String details;

    public LabTestAuditLog() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LabTestSubmission getSubmission() {
        return submission;
    }

    public void setSubmission(LabTestSubmission submission) {
        this.submission = submission;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public String getEventType() {
        return eventType;
    }

    public void setEventType(String eventType) {
        this.eventType = eventType;
    }

    public String getDetails() {
        return details;
    }

    public void setDetails(String details) {
        this.details = details;
    }
}
