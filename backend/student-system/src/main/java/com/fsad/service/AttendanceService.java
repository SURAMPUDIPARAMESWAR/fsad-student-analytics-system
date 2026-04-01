package com.fsad.service;


import com.fsad.model.Attendance;
import com.fsad.repository.AttendanceRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class AttendanceService {

    @Autowired
    private AttendanceRepository repo;

    public Attendance addAttendance(Attendance a) {
        return repo.save(a);
    }

    public List<Attendance> getByEmail(String email) {
        return repo.findByEmail(email);
    }

    public List<Attendance> getAll() {
        return repo.findAll();
    }

    public List<Attendance> getBySubject(String subject) {
        return repo.findBySubjectIgnoreCaseOrderByDateDesc(subject);
    }

    public List<Attendance> getBySubjectAndEmail(String subject, String email) {
        if (email == null || email.isBlank()) {
            return repo.findBySubjectIgnoreCaseOrderByDateDesc(subject);
        }
        return repo.findBySubjectIgnoreCaseAndEmailIgnoreCaseOrderByDateDesc(subject, email);
    }

    public Attendance updateAttendance(Long id, Attendance updated) {
        Optional<Attendance> existing = repo.findById(id);
        if (existing.isEmpty()) {
            throw new RuntimeException("Attendance record not found");
        }

        Attendance record = existing.get();
        if (updated.getEmail() != null) record.setEmail(updated.getEmail());
        if (updated.getDate() != null) record.setDate(updated.getDate());
        if (updated.getSubject() != null) record.setSubject(updated.getSubject());
        if (updated.getStatus() != null) record.setStatus(updated.getStatus());

        return repo.save(record);
    }
}
