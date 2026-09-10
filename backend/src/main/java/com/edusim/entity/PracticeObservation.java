package com.edusim.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "practice_observations")
public class PracticeObservation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    private String practiceObservationId;
    private Long experimentId;
    private String experimentName;
    private String subject;

    @Column(length = 2000, nullable = false)
    private String observation;

    @Column(length = 2000)
    private String conclusion;

    @Column(length = 2000)
    private String notes;

    @Column(columnDefinition = "LONGTEXT")
    private String simulationParameters;

    @Column(columnDefinition = "LONGTEXT")
    private String simulationReadings;

    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt = LocalDateTime.now();

    public PracticeObservation() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getStudent() {
        return student;
    }

    public void setStudent(User student) {
        this.student = student;
    }

    public String getPracticeObservationId() {
        return practiceObservationId;
    }

    public void setPracticeObservationId(String practiceObservationId) {
        this.practiceObservationId = practiceObservationId;
    }

    public Long getExperimentId() {
        return experimentId;
    }

    public void setExperimentId(Long experimentId) {
        this.experimentId = experimentId;
    }

    public String getExperimentName() {
        return experimentName;
    }

    public void setExperimentName(String experimentName) {
        this.experimentName = experimentName;
    }

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public String getObservation() {
        return observation;
    }

    public void setObservation(String observation) {
        this.observation = observation;
    }

    public String getConclusion() {
        return conclusion;
    }

    public void setConclusion(String conclusion) {
        this.conclusion = conclusion;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public String getSimulationParameters() {
        return simulationParameters;
    }

    public void setSimulationParameters(String simulationParameters) {
        this.simulationParameters = simulationParameters;
    }

    public String getSimulationReadings() {
        return simulationReadings;
    }

    public void setSimulationReadings(String simulationReadings) {
        this.simulationReadings = simulationReadings;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
