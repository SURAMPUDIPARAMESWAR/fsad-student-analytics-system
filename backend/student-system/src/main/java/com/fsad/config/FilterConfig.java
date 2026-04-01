package com.fsad.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.boot.web.servlet.FilterRegistrationBean;

import com.fsad.security.JwtFilter;

@Configuration
public class FilterConfig {

    @Bean
    public JwtFilter jwtFilter() {
        return new JwtFilter(); // 🔥 create manually
    }

    @Bean
    public FilterRegistrationBean<JwtFilter> filterRegistration() {

        FilterRegistrationBean<JwtFilter> registration = new FilterRegistrationBean<>();
        registration.setFilter(jwtFilter());
        registration.addUrlPatterns("/api/*");

        return registration;
    }
}

