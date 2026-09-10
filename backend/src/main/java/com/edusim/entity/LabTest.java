package com.edusim.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "lab_tests")
public class LabTest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String testName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Subject subject;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "experiment_id", nullable = false)
    private Experiment experiment;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "classroom_id", nullable = false)
    private Classroom classroom;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "teacher_id", nullable = false)
    private User teacher;

    @Column
    private LocalDateTime startDateTime;

    @Column
    private LocalDateTime endDateTime;

    @Column
    private Integer lateEntryGracePeriod; // in minutes

    @Column(nullable = false)
    private Integer duration; // in minutes

    @Column(nullable = false)
    private Integer practicalMarks;

    @Column(nullable = false)
    private Integer vivaMarks;

    @Column(nullable = false)
    private Integer totalMarks;

    @Column(nullable = false)
    private Integer passingMarks;

    @Column(length = 3000)
    private String instructions;

    @Column(nullable = false)
    private String questionSelectionMode; // "RANDOM" or "MANUAL"

    @Column(nullable = false)
    private String testState; // "DRAFT", "SCHEDULED", "ACTIVE", "ENDED", "ARCHIVED"

    @Column(length = 2000)
    private String frozenObjective;

    @Column(length = 2000)
    private String frozenTheory;

    @Column(length = 2000)
    private String frozenApparatus;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "lab_test_selected_questions",
        joinColumns = @JoinColumn(name = "lab_test_id"),
        inverseJoinColumns = @JoinColumn(name = "question_id")
    )
    private List<VivaQuestion> selectedQuestions = new ArrayList<>();

    public LabTest() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTestName() {
        return testName;
    }

    public void setTestName(String testName) {
        this.testName = testName;
    }

    public Subject getSubject() {
        return subject;
    }

    public void setSubject(Subject subject) {
        this.subject = subject;
    }

    public Experiment getExperiment() {
        return experiment;
    }

    public void setExperiment(Experiment experiment) {
        this.experiment = experiment;
    }

    public Classroom getClassroom() {
        return classroom;
    }

    public void setClassroom(Classroom classroom) {
        this.classroom = classroom;
    }

    public User getTeacher() {
        return teacher;
    }

    public void setTeacher(User teacher) {
        this.teacher = teacher;
    }

    public LocalDateTime getStartDateTime() {
        return startDateTime;
    }

    public void setStartDateTime(LocalDateTime startDateTime) {
        this.startDateTime = startDateTime;
    }

    public LocalDateTime getEndDateTime() {
        return endDateTime;
    }

    public void setEndDateTime(LocalDateTime endDateTime) {
        this.endDateTime = endDateTime;
    }

    public Integer getLateEntryGracePeriod() {
        return lateEntryGracePeriod;
    }

    public void setLateEntryGracePeriod(Integer lateEntryGracePeriod) {
        this.lateEntryGracePeriod = lateEntryGracePeriod;
    }

    public Integer getDuration() {
        return duration;
    }

    public void setDuration(Integer duration) {
        this.duration = duration;
    }

    public Integer getPracticalMarks() {
        return practicalMarks;
    }

    public void setPracticalMarks(Integer practicalMarks) {
        this.practicalMarks = practicalMarks;
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

    public Integer getPassingMarks() {
        return passingMarks;
    }

    public void setPassingMarks(Integer passingMarks) {
        this.passingMarks = passingMarks;
    }

    public String getInstructions() {
        return instructions;
    }

    public void setInstructions(String instructions) {
        this.instructions = instructions;
    }

    public String getQuestionSelectionMode() {
        return questionSelectionMode;
    }

    public void setQuestionSelectionMode(String questionSelectionMode) {
        this.questionSelectionMode = questionSelectionMode;
    }

    public String getTestState() {
        return testState;
    }

    public void setTestState(String testState) {
        this.testState = testState;
    }

    public String getFrozenObjective() {
        return frozenObjective;
    }

    public void setFrozenObjective(String frozenObjective) {
        this.frozenObjective = frozenObjective;
    }

    public String getFrozenTheory() {
        return frozenTheory;
    }

    public void setFrozenTheory(String frozenTheory) {
        this.frozenTheory = frozenTheory;
    }

    public String getFrozenApparatus() {
        return frozenApparatus;
    }

    public void setFrozenApparatus(String frozenApparatus) {
        this.frozenApparatus = frozenApparatus;
    }

    public List<VivaQuestion> getSelectedQuestions() {
        return selectedQuestions;
    }

    public void setSelectedQuestions(List<VivaQuestion> selectedQuestions) {
        this.selectedQuestions = selectedQuestions;
    }
}
