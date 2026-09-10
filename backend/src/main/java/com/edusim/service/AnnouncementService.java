package com.edusim.service;

import com.edusim.dto.AnnouncementRequest;
import com.edusim.entity.Announcement;
import com.edusim.entity.Classroom;
import com.edusim.entity.User;
import com.edusim.repository.AnnouncementRepository;
import com.edusim.repository.ClassroomRepository;
import com.edusim.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AnnouncementService {

    private final AnnouncementRepository announcementRepository;
    private final ClassroomRepository classroomRepository;
    private final UserRepository userRepository;

    public Announcement createAnnouncement(AnnouncementRequest request) {
        Classroom classroom = classroomRepository.findById(request.getClassroomId())
                .orElseThrow(() -> new RuntimeException("Classroom not found"));

        User teacher = userRepository.findById(request.getTeacherId())
                .orElseThrow(() -> new RuntimeException("Teacher not found"));

        Announcement announcement = new Announcement();
        announcement.setTitle(request.getTitle());
        announcement.setContent(request.getContent());
        announcement.setCreatedAt(LocalDateTime.now());
        announcement.setTeacher(teacher);
        announcement.setClassroom(classroom);

        return announcementRepository.save(announcement);
    }

    public List<Announcement> getAnnouncementsByClassroom(Long classroomId) {
        return announcementRepository.findByClassroomIdOrderByCreatedAtDesc(classroomId);
    }

    public List<Announcement> getAnnouncementsByStudent(Long studentId) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        Classroom classroom = student.getClassroom();
        if (classroom == null) {
            return new ArrayList<>();
        }

        return announcementRepository.findByClassroomIdOrderByCreatedAtDesc(classroom.getId());
    }

    public Announcement updateAnnouncement(Long id, AnnouncementRequest request) {
        Announcement announcement = announcementRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Announcement not found"));
        announcement.setTitle(request.getTitle());
        announcement.setContent(request.getContent());
        return announcementRepository.save(announcement);
    }

    public void deleteAnnouncement(Long id) {
        announcementRepository.deleteById(id);
    }
}
