package com.edusim.controller;

import com.edusim.dto.PracticeObservationRequest;
import com.edusim.entity.PracticeObservation;
import com.edusim.entity.User;
import com.edusim.repository.UserRepository;
import com.edusim.service.PracticeObservationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/practice-observations")
@RequiredArgsConstructor
public class PracticeObservationController {

    private final PracticeObservationService service;
    private final UserRepository userRepository;

    private User resolveStudent(Principal principal) {
        if (principal == null) {
            throw new RuntimeException("Unauthorized");
        }
        return userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("Student not found"));
    }

    @PostMapping
    public PracticeObservation saveObservation(Principal principal, @RequestBody PracticeObservationRequest request) {
        User student = resolveStudent(principal);
        return service.saveObservation(student, request);
    }

    @GetMapping
    public List<PracticeObservation> getStudentObservations(Principal principal) {
        User student = resolveStudent(principal);
        return service.getStudentObservations(student);
    }

    @PutMapping("/{id}")
    public PracticeObservation updateObservation(Principal principal, @PathVariable Long id, @RequestBody PracticeObservationRequest request) {
        User student = resolveStudent(principal);
        return service.updateObservation(id, student, request);
    }

    @DeleteMapping("/{id}")
    public void deleteObservation(Principal principal, @PathVariable Long id) {
        User student = resolveStudent(principal);
        service.deleteObservation(id, student);
    }
}
