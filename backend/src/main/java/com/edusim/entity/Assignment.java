package com.edusim.entity;

import jakarta.persistence.*;

import java.time.LocalDate;

@Entity
@Table(name = "assignments")
public class Assignment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private User student;

    @ManyToOne
    private User teacher;

    @ManyToOne
    private Experiment experiment;

    private LocalDate dueDate;

    private String status;
    private Integer score;
    private String remarks;

    private LocalDate completionDate;

    @ManyToOne
    @JoinColumn(name = "classroom_id")
    private Classroom classroom;

    @Column(length = 2000)
    private String observation;

    @Column(length = 2000)
    private String result;

    @Column(length = 2000)
    private String conclusion;

    @Column(length = 2000)
    private String notes;

    @Column(columnDefinition = "LONGTEXT")
    private String reportData;

    public Assignment() {
    }

    public Long getId() {
        return id;
    }

    public User getStudent() {
        return student;
    }

    public void setStudent(User student) {
        this.student = student;
    }

    public User getTeacher() {
        return teacher;
    }

    public void setTeacher(User teacher) {
        this.teacher = teacher;
    }

    public Experiment getExperiment() {
        return experiment;
    }

    public void setExperiment(Experiment experiment) {
        this.experiment = experiment;
    }

    public LocalDate getDueDate() {
        return dueDate;
    }

    public void setDueDate(LocalDate dueDate) {
        this.dueDate = dueDate;
    }

    public String getStatus() {
        if ("COMPLETED".equals(status)) {
            return score != null ? "GRADED" : "SUBMITTED";
        }
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
    public Integer getScore() {
    return score;
}

public void setScore(Integer score) {
    this.score = score;
}

public LocalDate getCompletionDate() {
    return completionDate;
}

public void setCompletionDate(LocalDate completionDate) {
    this.completionDate = completionDate;
}
public String getRemarks() {
    return remarks;
}

public void setRemarks(String remarks) {
    this.remarks = remarks;
}

    public Classroom getClassroom() {
        return classroom;
    }

    public void setClassroom(Classroom classroom) {
        this.classroom = classroom;
    }

    public String getObservation() {
        return observation;
    }

    public void setObservation(String observation) {
        this.observation = observation;
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

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public String getReportData() {
        return reportData;
    }

    public void setReportData(String reportData) {
        this.reportData = reportData;
    }
}