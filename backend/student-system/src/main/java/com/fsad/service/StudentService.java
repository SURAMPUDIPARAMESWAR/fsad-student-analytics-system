package com.fsad.service;

import com.fsad.model.Student;
import com.fsad.repository.StudentRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class StudentService {

    @Autowired
    private StudentRepository repo;

    public Student addStudent(Student s) {
        return repo.save(s);
    }

    public List<Student> getAllStudents() {
        return repo.findAll();
    }
}