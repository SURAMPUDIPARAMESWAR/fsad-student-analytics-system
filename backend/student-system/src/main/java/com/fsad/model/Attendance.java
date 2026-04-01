package com.fsad.model;


import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name="attendance")
public class Attendance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String email;   // link to student

    private String date;

    private String subject;

    private String status;  // Present / Absent
}

