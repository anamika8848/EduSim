package com.edusim.controller;

import com.edusim.dto.AnnouncementRequest;
import com.edusim.entity.Announcement;
import com.edusim.service.AnnouncementService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/announcements")
@RequiredArgsConstructor
public class AnnouncementController {

    private final AnnouncementService announcementService;

    @PostMapping
    public Announcement createAnnouncement(@RequestBody AnnouncementRequest request) {
        return announcementService.createAnnouncement(request);
    }

    @GetMapping("/classroom/{classroomId}")
    public List<Announcement> getAnnouncementsByClassroom(@PathVariable Long classroomId) {
        return announcementService.getAnnouncementsByClassroom(classroomId);
    }

    @GetMapping("/student/{studentId}")
    public List<Announcement> getAnnouncementsByStudent(@PathVariable Long studentId) {
        return announcementService.getAnnouncementsByStudent(studentId);
    }

    @PutMapping("/{id}")
    public Announcement updateAnnouncement(@PathVariable Long id, @RequestBody AnnouncementRequest request) {
        return announcementService.updateAnnouncement(id, request);
    }

    @DeleteMapping("/{id}")
    public void deleteAnnouncement(@PathVariable Long id) {
        announcementService.deleteAnnouncement(id);
    }
}
