package com.fsad.model;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
public class Marks {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String email;   // link to student

    private String subject;

    private int score;
}