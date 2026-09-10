package com.edusim.service;

import com.edusim.dto.VivaQuestionRequest;
import com.edusim.entity.Experiment;
import com.edusim.entity.VivaQuestion;
import com.edusim.repository.ExperimentRepository;
import com.edusim.repository.VivaQuestionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class VivaQuestionService {

    private final VivaQuestionRepository vivaQuestionRepository;
    private final ExperimentRepository experimentRepository;

    public List<VivaQuestion> getQuestionsByExperiment(Long experimentId) {
        return vivaQuestionRepository.findByExperimentId(experimentId);
    }

    public VivaQuestion addQuestion(Long experimentId, VivaQuestionRequest request) {
        Experiment experiment = experimentRepository.findById(experimentId)
                .orElseThrow(() -> new RuntimeException("Experiment not found"));

        VivaQuestion q = new VivaQuestion();
        q.setExperiment(experiment);
        q.setQuestionText(request.getQuestionText());
        return vivaQuestionRepository.save(q);
    }

    public VivaQuestion updateQuestion(Long questionId, VivaQuestionRequest request) {
        VivaQuestion q = vivaQuestionRepository.findById(questionId)
                .orElseThrow(() -> new RuntimeException("Question not found"));
        q.setQuestionText(request.getQuestionText());
        return vivaQuestionRepository.save(q);
    }

    public void deleteQuestion(Long questionId) {
        vivaQuestionRepository.deleteById(questionId);
    }
}
