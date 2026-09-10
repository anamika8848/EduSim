package com.edusim.repository;

import com.edusim.entity.LabTestVivaAnswer;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface LabTestVivaAnswerRepository extends JpaRepository<LabTestVivaAnswer, Long> {
    List<LabTestVivaAnswer> findBySubmissionId(Long submissionId);
}
