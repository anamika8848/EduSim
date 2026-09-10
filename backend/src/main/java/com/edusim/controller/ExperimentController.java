package com.edusim.controller;

import com.edusim.entity.Experiment;
import com.edusim.entity.Subject;
import com.edusim.service.ExperimentService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/experiments")
@RequiredArgsConstructor
public class ExperimentController {

    private final ExperimentService experimentService;

    @GetMapping
    public List<Experiment> getAllExperiments() {
        return experimentService.getAllExperiments();
    }

    @GetMapping("/subject/{subject}")
    public List<Experiment> getBySubject(@PathVariable Subject subject) {
        return experimentService.getExperimentsBySubject(subject);
    }

    @GetMapping("/{id}")
    public org.springframework.http.ResponseEntity<Experiment> getExperimentById(@PathVariable Long id) {
        Experiment experiment = experimentService.getExperimentById(id);
        if (experiment == null) {
            return org.springframework.http.ResponseEntity.notFound().build();
        }
        return org.springframework.http.ResponseEntity.ok(experiment);
    }
}