package com.edusim.repository;

import com.edusim.entity.VivaQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface VivaQuestionRepository extends JpaRepository<VivaQuestion, Long> {
    List<VivaQuestion> findByExperimentId(Long experimentId);
}
