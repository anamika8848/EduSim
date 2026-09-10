package com.edusim.dto;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;
import java.util.List;

public class LabTestRequest {

    private String testName;
    private String subject;
    private Long experimentId;
    private Long classroomId;
    private Long teacherId;
    private LocalDateTime startDateTime;
    private LocalDateTime endDateTime;
    private Integer lateEntryGracePeriod; // in minutes
    private Integer duration;
    private Integer practicalMarks;
    private Integer vivaMarks;
    private Integer passingMarks;
    private String instructions;
    private String questionSelectionMode; // RANDOM or MANUAL
    private String testState; // DRAFT or SCHEDULED
    private List<Long> selectedQuestionIds; // for MANUAL question selection

    public String getTestName() {
        return testName;
    }

    public void setTestName(String testName) {
        this.testName = testName;
    }

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public Long getExperimentId() {
        return experimentId;
    }

    public void setExperimentId(Long experimentId) {
        this.experimentId = experimentId;
    }

    public Long getClassroomId() {
        return classroomId;
    }

    public void setClassroomId(Long classroomId) {
        this.classroomId = classroomId;
    }

    public Long getTeacherId() {
        return teacherId;
    }

    public void setTeacherId(Long teacherId) {
        this.teacherId = teacherId;
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

    public List<Long> getSelectedQuestionIds() {
        return selectedQuestionIds;
    }

    public void setSelectedQuestionIds(List<Long> selectedQuestionIds) {
        this.selectedQuestionIds = selectedQuestionIds;
    }
}
