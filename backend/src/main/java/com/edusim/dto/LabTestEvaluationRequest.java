package com.edusim.dto;

public class LabTestEvaluationRequest {

    private Integer observationMarks;
    private Integer calculationMarks;
    private Integer conclusionMarks;
    private Integer vivaMarks;
    private String teacherRemarks;

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

    public String getTeacherRemarks() {
        return teacherRemarks;
    }

    public void setTeacherRemarks(String teacherRemarks) {
        this.teacherRemarks = teacherRemarks;
    }
}
