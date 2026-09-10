package com.edusim.service;

import com.edusim.entity.Experiment;
import com.edusim.entity.Subject;
import com.edusim.repository.ExperimentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ExperimentService {

    private final ExperimentRepository experimentRepository;

    public List<Experiment> getAllExperiments() {
        return experimentRepository.findAll();
    }

    public List<Experiment> getExperimentsBySubject(Subject subject) {
        return experimentRepository.findBySubject(subject);
    }

    public Experiment getExperimentById(Long id) {
        return experimentRepository.findById(id).orElse(null);
    }

    public Experiment saveExperiment(Experiment experiment) {
        return experimentRepository.save(experiment);
    }
}