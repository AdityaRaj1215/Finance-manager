package com.aditya.finance_manager.service;

import com.aditya.finance_manager.dto.LoginRequest;
import com.aditya.finance_manager.dto.LoginResponse;
import com.aditya.finance_manager.security.CustomUserDetails;
import com.aditya.finance_manager.security.JwtService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthService(AuthenticationManager authenticationManager, JwtService jwtService) {
        this.authenticationManager = authenticationManager;
        this.jwtService=jwtService;
    }

    public LoginResponse login(LoginRequest request) {

        Authentication authentication =
                UsernamePasswordAuthenticationToken.unauthenticated(
                        request.getEmail().trim(),
                        request.getPassword()
                );

        Authentication authenticated =
                authenticationManager.authenticate(authentication);

        CustomUserDetails userDetails =
                (CustomUserDetails) authenticated.getPrincipal();

        String token = jwtService.generateToken(userDetails);

        return new LoginResponse(
                token,
                userDetails.getUserId(),
                userDetails.getUser().getName(),
                userDetails.getUser().getEmail()
        );
    }
    }