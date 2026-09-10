package com.edusim.controller;

import com.edusim.dto.LabTestEvaluationRequest;
import com.edusim.dto.LabTestSubmissionRequest;
import com.edusim.dto.LabTestStatsResponse;
import com.edusim.entity.LabTestSubmission;
import com.edusim.service.LabTestSubmissionService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/lab-tests")
@RequiredArgsConstructor
public class LabTestSubmissionController {

    private final LabTestSubmissionService labTestSubmissionService;

    @PostMapping("/{testId}/submissions/start")
    public LabTestSubmission startSubmission(
            @PathVariable Long testId,
            @RequestParam Long studentId
    ) {
        return labTestSubmissionService.startSubmission(testId, studentId);
    }

    @PutMapping("/submissions/{id}/autosave")
    public LabTestSubmission autosaveSubmission(
            @PathVariable Long id,
            @RequestBody LabTestSubmissionRequest request
    ) {
        return labTestSubmissionService.autosaveSubmission(id, request);
    }

    @PostMapping("/submissions/{id}/log-event")
    public void logAuditEvent(
            @PathVariable Long id,
            @RequestParam String eventType,
            @RequestParam String details
    ) {
        labTestSubmissionService.logAuditEvent(id, eventType, details);
    }

    @PutMapping("/submissions/{id}/submit")
    public LabTestSubmission submitSubmission(@PathVariable Long id) {
        return labTestSubmissionService.submitSubmission(id);
    }

    @PutMapping("/submissions/{id}/force-submit")
    public LabTestSubmission forceSubmit(@PathVariable Long id) {
        return labTestSubmissionService.forceSubmit(id);
    }

    @PutMapping("/submissions/{id}/re-entry")
    public LabTestSubmission allowReentry(@PathVariable Long id) {
        return labTestSubmissionService.allowReentry(id);
    }

    @PutMapping("/submissions/{id}/evaluate")
    public LabTestSubmission evaluateSubmission(
            @PathVariable Long id,
            @RequestBody LabTestEvaluationRequest request
    ) {
        return labTestSubmissionService.evaluateSubmission(id, request);
    }

    @PutMapping("/submissions/{id}/reopen-evaluation")
    public LabTestSubmission reopenEvaluation(@PathVariable Long id) {
        return labTestSubmissionService.reopenEvaluation(id);
    }

    @GetMapping("/{testId}/submissions")
    public List<LabTestSubmission> getSubmissionsByTest(@PathVariable Long testId) {
        return labTestSubmissionService.getSubmissionsByTest(testId);
    }

    @GetMapping("/submissions/{id}")
    public LabTestSubmission getSubmissionById(@PathVariable Long id) {
        return labTestSubmissionService.getSubmissionById(id);
    }

    @GetMapping("/submissions/student/{studentId}/history")
    public List<LabTestSubmission> getStudentHistory(@PathVariable Long studentId) {
        return labTestSubmissionService.getStudentHistory(studentId);
    }

    @GetMapping("/{testId}/stats")
    public LabTestStatsResponse getTestStats(@PathVariable Long testId) {
        return labTestSubmissionService.getTestStats(testId);
    }
}
