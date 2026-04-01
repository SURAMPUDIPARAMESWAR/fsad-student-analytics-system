package com.fsad.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.fsad.model.User;

public interface UserRepository extends JpaRepository<User, Long> {

    User findByEmail(String email);

}