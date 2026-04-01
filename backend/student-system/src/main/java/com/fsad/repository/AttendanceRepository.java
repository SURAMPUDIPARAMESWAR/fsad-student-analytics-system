package com.fsad.repository;

import com.fsad.model.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AttendanceRepository extends JpaRepository<Attendance, Long> {

    List<Attendance> findByEmail(String email);

    List<Attendance> findBySubjectIgnoreCaseOrderByDateDesc(String subject);

    List<Attendance> findBySubjectIgnoreCaseAndEmailIgnoreCaseOrderByDateDesc(String subject, String email);

}