package com.edusim.controller;

import com.edusim.dto.LabTestRequest;
import com.edusim.entity.LabTest;
import com.edusim.service.LabTestService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/lab-tests")
@RequiredArgsConstructor
public class LabTestController {

    private final LabTestService labTestService;

    @PostMapping
    public LabTest createLabTest(@RequestBody LabTestRequest request) {
        return labTestService.createLabTest(request);
    }

    @PutMapping("/{id}")
    public LabTest updateLabTest(@PathVariable Long id, @RequestBody LabTestRequest request) {
        return labTestService.updateLabTest(id, request);
    }

    @GetMapping("/{id}")
    public LabTest getTestById(@PathVariable Long id) {
        return labTestService.getTestById(id);
    }

    @DeleteMapping("/{id}")
    public void deleteLabTest(@PathVariable Long id) {
        labTestService.deleteLabTest(id);
    }

    @GetMapping("/teacher/{teacherId}")
    public List<LabTest> getTestsByTeacher(@PathVariable Long teacherId) {
        return labTestService.getTestsByTeacher(teacherId);
    }

    @GetMapping("/student/{studentId}")
    public List<LabTest> getTestsForStudent(@PathVariable Long studentId) {
        return labTestService.getTestsForStudent(studentId);
    }

    @PutMapping("/{id}/state")
    public void updateTestState(@PathVariable Long id, @RequestParam String state) {
        labTestService.updateTestState(id, state);
    }
}
