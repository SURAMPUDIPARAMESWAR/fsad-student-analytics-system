package com.fsad.controller;

import com.fsad.model.Marks;
import com.fsad.service.MarksService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/marks")

@CrossOrigin("*")
public class MarksController {

    @Autowired
    private MarksService service;

    @PostMapping
    public Marks add(@RequestBody Marks m) {
        return service.addMarks(m);
    }

    @GetMapping("/{email}")
    public List<Marks> getByEmail(@PathVariable String email) {
        return service.getByEmail(email);
    }

    @GetMapping
    public List<Marks> getAll() {
        return service.getAll();
    }
}