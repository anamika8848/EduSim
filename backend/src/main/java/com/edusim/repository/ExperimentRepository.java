package com.edusim.repository;

import com.edusim.entity.Experiment;
import com.edusim.entity.Subject;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

import java.util.Optional;

public interface ExperimentRepository extends JpaRepository<Experiment, Long> {

    List<Experiment> findBySubject(Subject subject);

    Optional<Experiment> findByName(String name);

}