package com.edusim.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "lab_test_viva_answers")
public class LabTestVivaAnswer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "submission_id", nullable = false)
    @JsonIgnoreProperties({"vivaAnswers", "auditLogs"})
    private LabTestSubmission submission;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "viva_question_id")
    private VivaQuestion vivaQuestion;

    @Column(nullable = false, length = 1000)
    private String questionText; // Cached to freeze the question version

    @Column(length = 2000)
    private String studentAnswer;

    @Column(nullable = false)
    private Integer questionOrder;

    public LabTestVivaAnswer() {
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

    public VivaQuestion getVivaQuestion() {
        return vivaQuestion;
    }

    public void setVivaQuestion(VivaQuestion vivaQuestion) {
        this.vivaQuestion = vivaQuestion;
    }

    public String getQuestionText() {
        return questionText;
    }

    public void setQuestionText(String questionText) {
        this.questionText = questionText;
    }

    public String getStudentAnswer() {
        return studentAnswer;
    }

    public void setStudentAnswer(String studentAnswer) {
        this.studentAnswer = studentAnswer;
    }

    public Integer getQuestionOrder() {
        return questionOrder;
    }

    public void setQuestionOrder(Integer questionOrder) {
        this.questionOrder = questionOrder;
    }
}
