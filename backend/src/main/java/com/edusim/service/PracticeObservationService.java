package com.edusim.service;

import com.edusim.dto.PracticeObservationRequest;
import com.edusim.entity.PracticeObservation;
import com.edusim.entity.User;
import com.edusim.repository.PracticeObservationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PracticeObservationService {

    private final PracticeObservationRepository repository;

    public PracticeObservation saveObservation(User student, PracticeObservationRequest request) {
        PracticeObservation obs = new PracticeObservation();
        obs.setStudent(student);
        obs.setExperimentId(request.getExperimentId());
        obs.setExperimentName(request.getExperimentName());
        obs.setSubject(request.getSubject());
        obs.setObservation(request.getObservation());
        obs.setConclusion(request.getConclusion());
        obs.setNotes(request.getNotes());
        obs.setSimulationParameters(request.getSimulationParameters());
        obs.setSimulationReadings(request.getSimulationReadings());
        obs.setCreatedAt(LocalDateTime.now());
        obs.setUpdatedAt(LocalDateTime.now());

        // Save first to get the database id
        PracticeObservation saved = repository.save(obs);

        // Generate unique Practice Observation ID: PRACTICE-YYYY-XXXXXX
        int year = LocalDate.now().getYear();
        String formattedId = String.format("PRACTICE-%d-%06d", year, saved.getId());
        saved.setPracticeObservationId(formattedId);

        // Save again to persist the formatted ID
        return repository.save(saved);
    }

    public PracticeObservation updateObservation(Long id, User student, PracticeObservationRequest request) {
        PracticeObservation obs = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Practice observation not found"));

        // Enforce owner check
        if (!obs.getStudent().getId().equals(student.getId())) {
            throw new RuntimeException("Unauthorized: This observation does not belong to you.");
        }

        // Only allow editing Observation, Conclusion, and Personal Notes
        obs.setObservation(request.getObservation());
        obs.setConclusion(request.getConclusion());
        obs.setNotes(request.getNotes());
        obs.setUpdatedAt(LocalDateTime.now());

        return repository.save(obs);
    }

    public void deleteObservation(Long id, User student) {
        PracticeObservation obs = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Practice observation not found"));

        // Enforce owner check
        if (!obs.getStudent().getId().equals(student.getId())) {
            throw new RuntimeException("Unauthorized: This observation does not belong to you.");
        }

        repository.delete(obs);
    }

    public List<PracticeObservation> getStudentObservations(User student) {
        return repository.findByStudentId(student.getId());
    }
}
