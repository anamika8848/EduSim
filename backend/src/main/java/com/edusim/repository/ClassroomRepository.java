package com.edusim.repository;

import com.edusim.entity.Classroom;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ClassroomRepository extends JpaRepository<Classroom, Long> {

    Optional<Classroom> findByClassCode(String classCode);

    List<Classroom> findByTeacherId(Long teacherId);

}
