package com.fsad.security;

import jakarta.servlet.*;
import jakarta.servlet.http.*;

import java.io.IOException;


public class JwtFilter implements Filter {
	

    @Override
    public void doFilter(
        ServletRequest request,
        ServletResponse response,
        FilterChain chain
    ) throws IOException, ServletException {

        HttpServletRequest req = (HttpServletRequest) request;
        
        if ("OPTIONS".equalsIgnoreCase(req.getMethod())) {
            chain.doFilter(request, response);
            return;
        }

        String authHeader = req.getHeader("Authorization");

        if (authHeader != null && authHeader.startsWith("Bearer ")) {

            String token = authHeader.substring(7);

            try {
                String email = JwtUtil.extractEmail(token);
                System.out.println("VALID USER: " + email);
                // token valid → continue
            } catch (Exception e) {
                HttpServletResponse res = (HttpServletResponse) response;
                res.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                return;
            }

        } else {
            String path = req.getRequestURI();

            // allow login/register without token
            if (!path.contains("login") && !path.contains("register")) {
                HttpServletResponse res = (HttpServletResponse) response;
                res.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                return;
            }
        }

        chain.doFilter(request, response);
    }
}