package com.edusim.dto;

public class PracticeObservationRequest {
    private Long experimentId;
    private String experimentName;
    private String subject;
    private String observation;
    private String conclusion;
    private String notes;
    private String simulationParameters;
    private String simulationReadings;

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
}
