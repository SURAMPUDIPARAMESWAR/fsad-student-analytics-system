package com.fsad.controller;

import com.fsad.model.Attendance;
import com.fsad.service.AttendanceService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/attendance")
public class AttendanceController {

    @Autowired
    private AttendanceService service;

    @PostMapping
    public Attendance add(@RequestBody Attendance a) {
        return service.addAttendance(a);
    }

    @GetMapping("/{email}")
    public List<Attendance> getByEmail(@PathVariable String email) {
        return service.getByEmail(email);
    }

    @GetMapping
    public List<Attendance> getAll() {
        return service.getAll();
    }

    @GetMapping("/register")
    public List<Attendance> getSubjectRegister(
            @RequestParam String subject,
            @RequestParam(required = false) String email
    ) {
        return service.getBySubjectAndEmail(subject, email);
    }

    @PutMapping("/{id}")
    public Attendance updateById(@PathVariable Long id, @RequestBody Attendance attendance) {
        return service.updateAttendance(id, attendance);
    }

    @PatchMapping("/{id}")
    public Attendance patchById(@PathVariable Long id, @RequestBody Attendance attendance) {
        return service.updateAttendance(id, attendance);
    }
}