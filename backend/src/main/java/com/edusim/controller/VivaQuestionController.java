package com.edusim.controller;

import com.edusim.dto.VivaQuestionRequest;
import com.edusim.entity.VivaQuestion;
import com.edusim.service.VivaQuestionService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/experiments")
@RequiredArgsConstructor
public class VivaQuestionController {

    private final VivaQuestionService vivaQuestionService;

    @GetMapping("/{experimentId}/viva-questions")
    public List<VivaQuestion> getQuestionsByExperiment(@PathVariable Long experimentId) {
        return vivaQuestionService.getQuestionsByExperiment(experimentId);
    }

    @PostMapping("/{experimentId}/viva-questions")
    public VivaQuestion addQuestion(
            @PathVariable Long experimentId,
            @RequestBody VivaQuestionRequest request
    ) {
        return vivaQuestionService.addQuestion(experimentId, request);
    }

    @PutMapping("/viva-questions/{id}")
    public VivaQuestion updateQuestion(
            @PathVariable Long id,
            @RequestBody VivaQuestionRequest request
    ) {
        return vivaQuestionService.updateQuestion(id, request);
    }

    @DeleteMapping("/viva-questions/{id}")
    public void deleteQuestion(@PathVariable Long id) {
        vivaQuestionService.deleteQuestion(id);
    }
}
