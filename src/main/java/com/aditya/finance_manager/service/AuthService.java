package com.aditya.finance_manager.service;

import com.aditya.finance_manager.dto.LoginRequest;
import com.aditya.finance_manager.dto.LoginResponse;
import com.aditya.finance_manager.security.CustomUserDetails;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;

    public AuthService(AuthenticationManager authenticationManager) {
        this.authenticationManager = authenticationManager;
    }

    public LoginResponse login(LoginRequest request) {

        Authentication authentication =
                UsernamePasswordAuthenticationToken.unauthenticated(
                        request.getEmail(),
                        request.getPassword()
                );

        Authentication authenticated =
                authenticationManager.authenticate(authentication);

        CustomUserDetails userDetails =
                (CustomUserDetails) authenticated.getPrincipal();

        return new LoginResponse(
                userDetails.getUserId(),
                userDetails.getUser().getName(),
                userDetails.getUser().getEmail()
        );
    }
}