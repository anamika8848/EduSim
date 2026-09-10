package com.edusim.dto;

import java.util.List;

public class LabTestSubmissionRequest {

    private String observation;
    private String calculations;
    private String result;
    private String conclusion;
    private String reportData;
    private Integer warningsCount;
    private List<VivaAnswerItem> vivaAnswers;

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

    public Integer getWarningsCount() {
        return warningsCount;
    }

    public void setWarningsCount(Integer warningsCount) {
        this.warningsCount = warningsCount;
    }

    public List<VivaAnswerItem> getVivaAnswers() {
        return vivaAnswers;
    }

    public void setVivaAnswers(List<VivaAnswerItem> vivaAnswers) {
        this.vivaAnswers = vivaAnswers;
    }

    public static class VivaAnswerItem {
        private Long id; // This is the LabTestVivaAnswer record ID
        private String studentAnswer;

        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }

        public String getStudentAnswer() {
            return studentAnswer;
        }

        public void setStudentAnswer(String studentAnswer) {
            this.studentAnswer = studentAnswer;
        }
    }
}
