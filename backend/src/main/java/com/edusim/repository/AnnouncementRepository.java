package com.edusim.repository;

import com.edusim.entity.Announcement;
import com.edusim.entity.Classroom;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AnnouncementRepository extends JpaRepository<Announcement, Long> {

    List<Announcement> findByClassroomIdOrderByCreatedAtDesc(Long classroomId);

    List<Announcement> findByClassroomInOrderByCreatedAtDesc(List<Classroom> classrooms);

}
