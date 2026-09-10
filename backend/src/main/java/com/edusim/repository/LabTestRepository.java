package com.edusim.repository;

import com.edusim.entity.LabTest;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface LabTestRepository extends JpaRepository<LabTest, Long> {
    List<LabTest> findByClassroomId(Long classroomId);
    List<LabTest> findByTeacherId(Long teacherId);
}
