package com.edusim.service;

import com.edusim.dto.LabTestEvaluationRequest;
import com.edusim.dto.LabTestSubmissionRequest;
import com.edusim.dto.LabTestStatsResponse;
import com.edusim.entity.*;
import com.edusim.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class LabTestSubmissionService {

    private final LabTestSubmissionRepository labTestSubmissionRepository;
    private final LabTestRepository labTestRepository;
    private final UserRepository userRepository;
    private final VivaQuestionRepository vivaQuestionRepository;
    private final LabTestVivaAnswerRepository labTestVivaAnswerRepository;
    private final LabTestAuditLogRepository labTestAuditLogRepository;
    private final LabTestService labTestService;

    @Transactional
    public LabTestSubmission startSubmission(Long testId, Long studentId) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        LabTest labTest = labTestRepository.findById(testId)
                .orElseThrow(() -> new RuntimeException("Lab test not found"));

        // Auto update state
        labTestService.updateTestStateAuto(labTest);
        if ("DRAFT".equalsIgnoreCase(labTest.getTestState())) {
            throw new RuntimeException("This examination is a draft and cannot be started.");
        }

        // Restrict duplicate active examinations across the system
        List<LabTestSubmission> activeSubmissions = labTestSubmissionRepository.findByStudentIdAndStatus(studentId, "IN_PROGRESS");
        for (LabTestSubmission activeSub : activeSubmissions) {
            if (!activeSub.getLabTest().getId().equals(testId)) {
                throw new RuntimeException("ACTIVE_EXAM_EXISTS: You have another practical examination in progress: " + 
                        activeSub.getLabTest().getTestName() + ". You must submit it before opening another.");
            }
        }

        Optional<LabTestSubmission> existingOpt = labTestSubmissionRepository.findByStudentIdAndLabTestId(studentId, testId);
        LabTestSubmission submission = existingOpt.orElseGet(() -> {
            LabTestSubmission sub = new LabTestSubmission();
            sub.setLabTest(labTest);
            sub.setStudent(student);
            sub.setStatus("NOT_STARTED");
            sub.setWarningsCount(0);
            return labTestSubmissionRepository.save(sub);
        });

        // Re-entry check
        if ("IN_PROGRESS".equalsIgnoreCase(submission.getStatus())) {
            // Already started, re-entry allowed
            logAuditEvent(submission.getId(), "REOPENED", "Student re-entered the examination room.");
            return submission;
        }

        if ("SUBMITTED".equalsIgnoreCase(submission.getStatus()) || 
            "EVALUATED".equalsIgnoreCase(submission.getStatus()) || 
            "EXPIRED".equalsIgnoreCase(submission.getStatus())) {
            throw new RuntimeException("You have already submitted or completed this examination. Re-entry is denied.");
        }

        if (labTest.getStartDateTime() == null || labTest.getEndDateTime() == null) {
            throw new RuntimeException("This examination is not scheduled properly.");
        }

        // Must be NOT_STARTED. Check time window
        LocalDateTime now = LocalDateTime.now();
        if (now.isBefore(labTest.getStartDateTime())) {
            throw new RuntimeException("This examination has not started yet. Scheduled to start at: " + labTest.getStartDateTime());
        }
        if (now.isAfter(labTest.getEndDateTime())) {
            throw new RuntimeException("This examination has already ended.");
        }
        if (now.isAfter(labTest.getStartDateTime().plusMinutes(labTest.getLateEntryGracePeriod()))) {
            throw new RuntimeException("The late entry window of " + labTest.getLateEntryGracePeriod() + " minutes has closed. You cannot start this examination anymore.");
        }

        // Initialize Attempt
        submission.setStatus("IN_PROGRESS");
        submission.setStartTime(LocalDateTime.now());
        submission = labTestSubmissionRepository.save(submission);

        // Seed assigned questions
        List<VivaQuestion> questionsPool = new ArrayList<>();
        if ("MANUAL".equalsIgnoreCase(labTest.getQuestionSelectionMode())) {
            questionsPool = labTest.getSelectedQuestions();
        } else {
            // RANDOM
            questionsPool = vivaQuestionRepository.findByExperimentId(labTest.getExperiment().getId());
            Collections.shuffle(questionsPool);
        }

        // Take up to 5 questions
        int limit = Math.min(5, questionsPool.size());
        for (int i = 0; i < limit; i++) {
            VivaQuestion q = questionsPool.get(i);
            LabTestVivaAnswer ans = new LabTestVivaAnswer();
            ans.setSubmission(submission);
            ans.setVivaQuestion(q);
            ans.setQuestionText(q.getQuestionText());
            ans.setQuestionOrder(i + 1);
            ans.setStudentAnswer("");
            labTestVivaAnswerRepository.save(ans);
        }

        logAuditEvent(submission.getId(), "STARTED", "Examination started. Caching selected questions.");

        return labTestSubmissionRepository.findById(submission.getId()).orElse(submission);
    }

    @Transactional
    public LabTestSubmission autosaveSubmission(Long submissionId, LabTestSubmissionRequest request) {
        LabTestSubmission submission = labTestSubmissionRepository.findById(submissionId)
                .orElseThrow(() -> new RuntimeException("Submission not found"));

        if (!"IN_PROGRESS".equalsIgnoreCase(submission.getStatus())) {
            throw new RuntimeException("Autosave denied: Examination is not in progress.");
        }

        // Verify duration timeout
        long elapsedSeconds = Duration.between(submission.getStartTime(), LocalDateTime.now()).getSeconds();
        long limitSeconds = submission.getLabTest().getDuration() * 60;
        if (elapsedSeconds >= limitSeconds) {
            // Auto submit
            submission.setStatus("EXPIRED");
            submission.setCompletionTime(LocalDateTime.now());
            labTestSubmissionRepository.save(submission);
            logAuditEvent(submissionId, "AUTO_SUBMITTED", "Examination automatically submitted due to time limit expiration.");
            return submission;
        }

        submission.setObservation(request.getObservation());
        submission.setCalculations(request.getCalculations());
        submission.setResult(request.getResult());
        submission.setConclusion(request.getConclusion());
        submission.setReportData(request.getReportData());

        // Save viva answers
        if (request.getVivaAnswers() != null) {
            for (LabTestSubmissionRequest.VivaAnswerItem item : request.getVivaAnswers()) {
                labTestVivaAnswerRepository.findById(item.getId()).ifPresent(ans -> {
                    if (ans.getSubmission().getId().equals(submissionId)) {
                        ans.setStudentAnswer(item.getStudentAnswer());
                        labTestVivaAnswerRepository.save(ans);
                    }
                });
            }
        }

        submission = labTestSubmissionRepository.save(submission);
        return submission;
    }

    @Transactional
    public void logAuditEvent(Long submissionId, String eventType, String details) {
        LabTestSubmission submission = labTestSubmissionRepository.findById(submissionId)
                .orElseThrow(() -> new RuntimeException("Submission not found"));

        LabTestAuditLog log = new LabTestAuditLog();
        log.setSubmission(submission);
        log.setTimestamp(LocalDateTime.now());
        log.setEventType(eventType.toUpperCase());
        log.setDetails(details);
        labTestAuditLogRepository.save(log);

        // Warnings checking
        if ("TAB_SWITCH".equalsIgnoreCase(eventType) || "FULLSCREEN_EXIT".equalsIgnoreCase(eventType)) {
            int currentWarnings = submission.getWarningsCount() != null ? submission.getWarningsCount() : 0;
            currentWarnings++;
            submission.setWarningsCount(currentWarnings);
            labTestSubmissionRepository.save(submission);

            if (currentWarnings >= 3) {
                // Trigger auto-submit
                submission.setStatus("EXPIRED");
                submission.setCompletionTime(LocalDateTime.now());
                labTestSubmissionRepository.save(submission);

                LabTestAuditLog autoLog = new LabTestAuditLog();
                autoLog.setSubmission(submission);
                autoLog.setTimestamp(LocalDateTime.now());
                autoLog.setEventType("AUTO_SUBMITTED");
                autoLog.setDetails("Auto-submitted: integrity policy violated (3 warnings accumulated).");
                labTestAuditLogRepository.save(autoLog);
            }
        }
    }

    @Transactional
    public LabTestSubmission submitSubmission(Long submissionId) {
        LabTestSubmission submission = labTestSubmissionRepository.findById(submissionId)
                .orElseThrow(() -> new RuntimeException("Submission not found"));

        if (!"IN_PROGRESS".equalsIgnoreCase(submission.getStatus())) {
            throw new RuntimeException("Submission denied: Examination is not in progress.");
        }

        submission.setStatus("SUBMITTED");
        submission.setCompletionTime(LocalDateTime.now());
        submission = labTestSubmissionRepository.save(submission);

        logAuditEvent(submissionId, "SUBMITTED", "Examination submitted successfully by student.");
        return submission;
    }

    @Transactional
    public LabTestSubmission forceSubmit(Long submissionId) {
        LabTestSubmission submission = labTestSubmissionRepository.findById(submissionId)
                .orElseThrow(() -> new RuntimeException("Submission not found"));

        submission.setStatus("SUBMITTED");
        submission.setCompletionTime(LocalDateTime.now());
        submission = labTestSubmissionRepository.save(submission);

        logAuditEvent(submissionId, "ADMIN_FORCE_SUBMIT", "Force-submitted by administrator.");
        return submission;
    }

    @Transactional
    public LabTestSubmission allowReentry(Long submissionId) {
        LabTestSubmission submission = labTestSubmissionRepository.findById(submissionId)
                .orElseThrow(() -> new RuntimeException("Submission not found"));

        submission.setStatus("IN_PROGRESS");
        submission.setWarningsCount(0); // Reset warnings
        submission = labTestSubmissionRepository.save(submission);

        logAuditEvent(submissionId, "ADMIN_ALLOW_REENTRY", "Re-entry allowed by teacher. Integrity warning counter reset to 0.");
        return submission;
    }

    @Transactional
    public LabTestSubmission evaluateSubmission(Long submissionId, LabTestEvaluationRequest request) {
        LabTestSubmission submission = labTestSubmissionRepository.findById(submissionId)
                .orElseThrow(() -> new RuntimeException("Submission not found"));

        // Evaluation locking validation
        if ("EVALUATED".equalsIgnoreCase(submission.getStatus())) {
            throw new RuntimeException("Evaluation is locked. Reopen the evaluation to make changes.");
        }

        submission.setObservationMarks(request.getObservationMarks());
        submission.setCalculationMarks(request.getCalculationMarks());
        submission.setConclusionMarks(request.getConclusionMarks());
        submission.setVivaMarks(request.getVivaMarks());
        
        int total = request.getObservationMarks() + request.getCalculationMarks() + request.getConclusionMarks() + request.getVivaMarks();
        submission.setTotalMarks(total);

        // Grade calculation
        double pct = ((double) total / submission.getLabTest().getTotalMarks()) * 100;
        String grade;
        if (pct >= 90) grade = "A+";
        else if (pct >= 80) grade = "A";
        else if (pct >= 70) grade = "B";
        else if (pct >= 60) grade = "C";
        else if (pct >= 50) grade = "D";
        else grade = "F";
        
        submission.setGrade(grade);
        submission.setTeacherRemarks(request.getTeacherRemarks());
        submission.setStatus("EVALUATED");

        submission = labTestSubmissionRepository.save(submission);
        logAuditEvent(submissionId, "EVALUATED", "Examination evaluation completed. Total marks published: " + total + "/" + submission.getLabTest().getTotalMarks() + " (Grade: " + grade + ")");
        return submission;
    }

    @Transactional
    public LabTestSubmission reopenEvaluation(Long submissionId) {
        LabTestSubmission submission = labTestSubmissionRepository.findById(submissionId)
                .orElseThrow(() -> new RuntimeException("Submission not found"));

        if (!"EVALUATED".equalsIgnoreCase(submission.getStatus())) {
            throw new RuntimeException("Submission is not evaluated yet.");
        }

        submission.setStatus("SUBMITTED");
        submission = labTestSubmissionRepository.save(submission);

        logAuditEvent(submissionId, "STAGE_CHANGE", "Evaluation reopened by teacher.");
        return submission;
    }

    public List<LabTestSubmission> getSubmissionsByTest(Long testId) {
        return labTestSubmissionRepository.findByLabTestId(testId);
    }

    public LabTestSubmission getSubmissionById(Long id) {
        return labTestSubmissionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Submission not found"));
    }

    public List<LabTestSubmission> getStudentHistory(Long studentId) {
        return labTestSubmissionRepository.findByStudentId(studentId);
    }

    public LabTestStatsResponse getTestStats(Long testId) {
        LabTest labTest = labTestRepository.findById(testId)
                .orElseThrow(() -> new RuntimeException("Lab test not found"));

        List<LabTestSubmission> subs = labTestSubmissionRepository.findByLabTestId(testId);
        
        int totalAssigned = subs.size();
        int started = 0;
        int inProgress = 0;
        int submitted = 0;
        int evaluated = 0;
        int absent = 0;
        int autoSub = 0;
        int passCount = 0;
        int failCount = 0;
        
        double totalTime = 0;
        int timedCount = 0;
        
        double totalWarnings = 0;
        int startedWithWarningStats = 0;

        double sumMarks = 0;
        int gradedCount = 0;

        int highest = 0;
        int lowest = Integer.MAX_VALUE;

        for (LabTestSubmission sub : subs) {
            String status = sub.getStatus();
            if ("NOT_STARTED".equalsIgnoreCase(status)) {
                absent++;
            } else {
                started++;
                if ("IN_PROGRESS".equalsIgnoreCase(status)) {
                    inProgress++;
                } else if ("SUBMITTED".equalsIgnoreCase(status)) {
                    submitted++;
                } else if ("EVALUATED".equalsIgnoreCase(status)) {
                    evaluated++;
                } else if ("EXPIRED".equalsIgnoreCase(status)) {
                    // Missed time limits / auto submitted
                    submitted++; 
                }

                if (sub.getWarningsCount() != null) {
                    totalWarnings += sub.getWarningsCount();
                    startedWithWarningStats++;
                    if (sub.getWarningsCount() >= 3) {
                        autoSub++;
                    }
                }

                if (sub.getStartTime() != null && sub.getCompletionTime() != null) {
                    long durationSecs = Duration.between(sub.getStartTime(), sub.getCompletionTime()).getSeconds();
                    totalTime += (durationSecs / 60.0);
                    timedCount++;
                }

                if (sub.getTotalMarks() != null) {
                    int marks = sub.getTotalMarks();
                    sumMarks += marks;
                    gradedCount++;
                    if (marks > highest) highest = marks;
                    if (marks < lowest) lowest = marks;

                    if (marks >= labTest.getPassingMarks()) {
                        passCount++;
                    } else {
                        failCount++;
                    }
                }
            }
        }

        if (lowest == Integer.MAX_VALUE) {
            lowest = 0;
        }

        LabTestStatsResponse stats = new LabTestStatsResponse();
        stats.setTotalAssigned(totalAssigned);
        stats.setStartedCount(started);
        stats.setInProgressCount(inProgress);
        stats.setSubmittedCount(submitted);
        stats.setEvaluatedCount(evaluated);
        stats.setAbsentCount(absent);
        stats.setTotalAutoSubmissions(autoSub);
        
        stats.setAverageTimeMinutes(timedCount > 0 ? (totalTime / timedCount) : 0.0);
        stats.setAverageWarningCount(startedWithWarningStats > 0 ? (totalWarnings / startedWithWarningStats) : 0.0);
        
        double passPct = gradedCount > 0 ? (((double) passCount / gradedCount) * 100) : 0.0;
        double failPct = gradedCount > 0 ? (((double) failCount / gradedCount) * 100) : 0.0;
        stats.setPassPercentage(passPct);
        stats.setFailPercentage(failPct);
        stats.setAverageMarks(gradedCount > 0 ? (sumMarks / gradedCount) : 0.0);
        stats.setHighestMarks(highest);
        stats.setLowestMarks(lowest);

        return stats;
    }
}
