package com.fsad.model;


import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name="user")

@Data
@NoArgsConstructor
@AllArgsConstructor

public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String email;
    private String password;
    private String role;

    // getters and setters
}