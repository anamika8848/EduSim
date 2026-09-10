package com.edusim.repository;

import com.edusim.entity.PracticeObservation;
import com.edusim.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PracticeObservationRepository extends JpaRepository<PracticeObservation, Long> {
    List<PracticeObservation> findByStudent(User student);
    List<PracticeObservation> findByStudentId(Long studentId);
}
