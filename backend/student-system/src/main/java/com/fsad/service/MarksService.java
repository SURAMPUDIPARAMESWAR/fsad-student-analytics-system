package com.fsad.service;

import com.fsad.model.Marks;
import com.fsad.repository.MarksRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MarksService {

    @Autowired
    private MarksRepository repo;

    public Marks addMarks(Marks m) {
        return repo.save(m);
    }

    public List<Marks> getByEmail(String email) {
        return repo.findByEmail(email);
    }

    public List<Marks> getAll() {
        return repo.findAll();
    }
}