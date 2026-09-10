package com.edusim.service;

import com.edusim.dto.ClassroomRequest;
import com.edusim.dto.JoinClassRequest;
import com.edusim.entity.Classroom;
import com.edusim.entity.User;
import com.edusim.entity.Role;
import com.edusim.repository.ClassroomRepository;
import com.edusim.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class ClassroomService {

    private final ClassroomRepository classroomRepository;
    private final UserRepository userRepository;

    public Classroom createClassroom(ClassroomRequest request) {
        User teacher = userRepository.findById(request.getTeacherId())
                .orElseThrow(() -> new RuntimeException("Teacher not found"));

        if (teacher.getRole() != Role.TEACHER) {
            throw new RuntimeException("User is not a teacher");
        }

        Classroom classroom = new Classroom();
        classroom.setClassName(request.getClassName());
        classroom.setTeacher(teacher);

        // Generate clean unique code like CL9A8492
        String codePrefix = request.getClassName()
                .replaceAll("[^a-zA-Z0-9]", "")
                .toUpperCase();
        if (codePrefix.length() > 6) {
            codePrefix = codePrefix.substring(0, 6);
        }
        
        String finalCode;
        Random random = new Random();
        do {
            int randomNum = 1000 + random.nextInt(9000); // 4 digit number
            finalCode = codePrefix + randomNum;
        } while (classroomRepository.findByClassCode(finalCode).isPresent());

        classroom.setClassCode(finalCode);
        return classroomRepository.save(classroom);
    }

    public Classroom joinClassroom(JoinClassRequest request) {
        User student = userRepository.findById(request.getStudentId())
                .orElseThrow(() -> new RuntimeException("Student not found"));

        if (student.getRole() != Role.STUDENT) {
            throw new RuntimeException("User is not a student");
        }

        if (student.getClassroom() != null) {
            throw new RuntimeException("You are already enrolled in Class " + student.getClassroom().getClassName() + ". Leave the current classroom before joining another.");
        }

        Classroom classroom = classroomRepository.findByClassCode(request.getClassCode())
                .orElseThrow(() -> new RuntimeException("Classroom not found with code: " + request.getClassCode()));

        student.setClassroom(classroom);
        userRepository.save(student);

        return classroom;
    }

    public List<Classroom> getClassroomsByTeacher(Long teacherId) {
        return classroomRepository.findByTeacherId(teacherId);
    }

    public Classroom getClassroomByStudent(Long studentId) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        return student.getClassroom();
    }

    public Classroom getClassroomById(Long id) {
        return classroomRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Classroom not found"));
    }

    public void leaveClassroom(String email) {
        User student = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        if (student.getRole() != Role.STUDENT) {
            throw new RuntimeException("Only students can leave a classroom");
        }
        student.setClassroom(null);
        userRepository.save(student);
    }

    public void removeStudentFromClassroom(Long studentId) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        student.setClassroom(null);
        userRepository.save(student);
    }
}
