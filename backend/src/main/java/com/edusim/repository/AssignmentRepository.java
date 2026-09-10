package com.edusim.repository;

import com.edusim.entity.Assignment;
import com.edusim.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AssignmentRepository extends JpaRepository<Assignment, Long> {

    List<Assignment> findByStudent(User student);

    List<Assignment> findByTeacher(User teacher);
    List<Assignment> findByStudentId(Long studentId);
    List<Assignment> findByTeacherId(Long teacherId);
    List<Assignment> findByClassroomId(Long classroomId);
}