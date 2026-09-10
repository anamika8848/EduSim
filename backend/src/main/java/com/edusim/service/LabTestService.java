package com.edusim.service;

import com.edusim.dto.LabTestRequest;
import com.edusim.entity.*;
import com.edusim.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class LabTestService {

    private final LabTestRepository labTestRepository;
    private final ExperimentRepository experimentRepository;
    private final ClassroomRepository classroomRepository;
    private final UserRepository userRepository;
    private final VivaQuestionRepository vivaQuestionRepository;
    private final LabTestSubmissionRepository labTestSubmissionRepository;

    @Transactional
    public LabTest createLabTest(LabTestRequest request) {
        Experiment experiment = experimentRepository.findById(request.getExperimentId())
                .orElseThrow(() -> new RuntimeException("Experiment not found"));

        Classroom classroom = classroomRepository.findById(request.getClassroomId())
                .orElseThrow(() -> new RuntimeException("Classroom not found"));

        User teacher = userRepository.findById(request.getTeacherId())
                .orElseThrow(() -> new RuntimeException("Teacher not found"));

        LabTest labTest = new LabTest();
        labTest.setTestName(request.getTestName());
        labTest.setSubject(Subject.valueOf(request.getSubject().toUpperCase()));
        labTest.setExperiment(experiment);
        labTest.setClassroom(classroom);
        labTest.setTeacher(teacher);
        labTest.setStartDateTime(request.getStartDateTime());
        labTest.setEndDateTime(request.getEndDateTime());
        labTest.setLateEntryGracePeriod(request.getLateEntryGracePeriod());
        labTest.setDuration(request.getDuration());
        labTest.setPracticalMarks(request.getPracticalMarks());
        labTest.setVivaMarks(request.getVivaMarks());
        labTest.setTotalMarks(request.getPracticalMarks() + request.getVivaMarks());
        labTest.setPassingMarks(request.getPassingMarks());
        labTest.setInstructions(request.getInstructions());
        labTest.setQuestionSelectionMode(request.getQuestionSelectionMode());
        
        // Default frozen metadata to experiment description/details if empty
        labTest.setFrozenObjective("To study the properties and outcomes of " + experiment.getName());
        labTest.setFrozenTheory(experiment.getDescription());
        labTest.setFrozenApparatus("Virtual simulation controllers, recorded data sheet");

        // Set state
        String state = request.getTestState() != null ? request.getTestState() : "DRAFT";
        labTest.setTestState(state);

        // Load selected questions if manual question selection is chosen
        if ("MANUAL".equalsIgnoreCase(request.getQuestionSelectionMode()) && request.getSelectedQuestionIds() != null) {
            List<VivaQuestion> selected = new ArrayList<>();
            for (Long qId : request.getSelectedQuestionIds()) {
                vivaQuestionRepository.findById(qId).ifPresent(selected::add);
            }
            labTest.setSelectedQuestions(selected);
        }

        LabTest savedTest = labTestRepository.save(labTest);

        // If scheduled, pre-create attendance placeholders
        if ("SCHEDULED".equalsIgnoreCase(state)) {
            preCreateSubmissionsForClass(savedTest, classroom);
        }

        return savedTest;
    }

    @Transactional
    public LabTest updateLabTest(Long testId, LabTestRequest request) {
        LabTest labTest = labTestRepository.findById(testId)
                .orElseThrow(() -> new RuntimeException("Lab test not found"));

        // Locked if ACTIVE, ENDED, ARCHIVED
        updateTestStateAuto(labTest);
        if ("ACTIVE".equalsIgnoreCase(labTest.getTestState()) || 
            "ENDED".equalsIgnoreCase(labTest.getTestState()) || 
            "ARCHIVED".equalsIgnoreCase(labTest.getTestState())) {
            throw new RuntimeException("Cannot edit test once it has started or ended.");
        }

        labTest.setTestName(request.getTestName());
        labTest.setStartDateTime(request.getStartDateTime());
        labTest.setEndDateTime(request.getEndDateTime());
        labTest.setLateEntryGracePeriod(request.getLateEntryGracePeriod());
        labTest.setDuration(request.getDuration());
        labTest.setPracticalMarks(request.getPracticalMarks());
        labTest.setVivaMarks(request.getVivaMarks());
        labTest.setTotalMarks(request.getPracticalMarks() + request.getVivaMarks());
        labTest.setPassingMarks(request.getPassingMarks());
        labTest.setInstructions(request.getInstructions());
        labTest.setQuestionSelectionMode(request.getQuestionSelectionMode());

        if (request.getTestState() != null) {
            String oldState = labTest.getTestState();
            labTest.setTestState(request.getTestState());
            // If transitioned to SCHEDULED, pre-create submissions
            if ("SCHEDULED".equalsIgnoreCase(request.getTestState()) && !"SCHEDULED".equalsIgnoreCase(oldState)) {
                preCreateSubmissionsForClass(labTest, labTest.getClassroom());
            }
        }

        if ("MANUAL".equalsIgnoreCase(request.getQuestionSelectionMode()) && request.getSelectedQuestionIds() != null) {
            List<VivaQuestion> selected = new ArrayList<>();
            for (Long qId : request.getSelectedQuestionIds()) {
                vivaQuestionRepository.findById(qId).ifPresent(selected::add);
            }
            labTest.setSelectedQuestions(selected);
        } else {
            labTest.getSelectedQuestions().clear();
        }

        return labTestRepository.save(labTest);
    }

    public List<LabTest> getTestsByTeacher(Long teacherId) {
        List<LabTest> list = labTestRepository.findByTeacherId(teacherId);
        for (LabTest test : list) {
            updateTestStateAuto(test);
        }
        return list;
    }

    public List<LabTest> getTestsForStudent(Long studentId) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        Classroom classroom = student.getClassroom();
        if (classroom == null) {
            return new ArrayList<>();
        }

        List<LabTest> tests = labTestRepository.findByClassroomId(classroom.getId());
        for (LabTest test : tests) {
            updateTestStateAuto(test);
            // double-safe attendance pre-generation
            if (!"DRAFT".equalsIgnoreCase(test.getTestState()) && 
                !labTestSubmissionRepository.existsByStudentIdAndLabTestId(studentId, test.getId())) {
                LabTestSubmission sub = new LabTestSubmission();
                sub.setLabTest(test);
                sub.setStudent(student);
                sub.setStatus("NOT_STARTED");
                sub.setWarningsCount(0);
                labTestSubmissionRepository.save(sub);
            }
        }
        return tests;
    }

    public LabTest getTestById(Long id) {
        LabTest test = labTestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Lab test not found"));
        updateTestStateAuto(test);
        return test;
    }

    @Transactional
    public void deleteLabTest(Long id) {
        LabTest test = labTestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Lab test not found"));
        
        // Delete all submissions associated with this test first to satisfy FK constraints
        List<LabTestSubmission> submissions = labTestSubmissionRepository.findByLabTestId(id);
        if (submissions != null && !submissions.isEmpty()) {
            labTestSubmissionRepository.deleteAll(submissions);
        }

        labTestRepository.delete(test);
    }

    @Transactional
    public void updateTestState(Long id, String state) {
        LabTest test = labTestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Lab test not found"));
        test.setTestState(state.toUpperCase());
        if ("SCHEDULED".equalsIgnoreCase(state)) {
            preCreateSubmissionsForClass(test, test.getClassroom());
        }
        labTestRepository.save(test);
    }

    private void preCreateSubmissionsForClass(LabTest test, Classroom classroom) {
        List<User> students = classroom.getStudents();
        if (students != null) {
            for (User student : students) {
                if (!labTestSubmissionRepository.existsByStudentIdAndLabTestId(student.getId(), test.getId())) {
                    LabTestSubmission sub = new LabTestSubmission();
                    sub.setLabTest(test);
                    sub.setStudent(student);
                    sub.setStatus("NOT_STARTED");
                    sub.setWarningsCount(0);
                    labTestSubmissionRepository.save(sub);
                }
            }
        }
    }

    public void updateTestStateAuto(LabTest test) {
        if ("DRAFT".equalsIgnoreCase(test.getTestState()) || "ARCHIVED".equalsIgnoreCase(test.getTestState())) {
            return;
        }

        if (test.getStartDateTime() == null || test.getEndDateTime() == null) {
            test.setTestState("DRAFT");
            return;
        }

        LocalDateTime now = LocalDateTime.now();
        if (now.isBefore(test.getStartDateTime())) {
            test.setTestState("SCHEDULED");
        } else if (now.isAfter(test.getEndDateTime())) {
            test.setTestState("ENDED");
        } else {
            test.setTestState("ACTIVE");
        }
        // Do NOT permanently save ACTIVE or ENDED in the database every second.
        // We set it on the transient object so it propagates to the JSON output.
    }
}
