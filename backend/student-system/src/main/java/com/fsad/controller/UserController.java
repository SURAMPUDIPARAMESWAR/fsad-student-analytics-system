package com.fsad.controller;


import com.fsad.model.User;
import com.fsad.service.UserService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService service;

    // Register API
    @PostMapping("/register")
    public String register(@RequestBody User user) {
        return service.register(user);
    }

    // Login API
    @PostMapping("/login")
    public Object login(@RequestBody User user) {
        return service.login(user.getEmail(), user.getPassword());
    }
}