package com.edusim.repository;

import com.edusim.entity.LabTestSubmission;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface LabTestSubmissionRepository extends JpaRepository<LabTestSubmission, Long> {
    List<LabTestSubmission> findByStudentId(Long studentId);
    List<LabTestSubmission> findByLabTestId(Long labTestId);
    Optional<LabTestSubmission> findByStudentIdAndLabTestId(Long studentId, Long labTestId);
    boolean existsByStudentIdAndLabTestId(Long studentId, Long labTestId);
    List<LabTestSubmission> findByStudentIdAndStatus(Long studentId, String status);
}
