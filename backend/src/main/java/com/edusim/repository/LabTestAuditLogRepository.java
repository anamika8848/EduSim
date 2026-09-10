package com.edusim.repository;

import com.edusim.entity.LabTestAuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface LabTestAuditLogRepository extends JpaRepository<LabTestAuditLog, Long> {
    List<LabTestAuditLog> findBySubmissionIdOrderByTimestampAsc(Long submissionId);
}
