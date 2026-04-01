package com.fsad.repository;

import com.fsad.model.Marks;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MarksRepository extends JpaRepository<Marks, Long> {

    List<Marks> findByEmail(String email);

}