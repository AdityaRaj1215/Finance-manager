package com.aditya.finance_manager.service;

import com.aditya.finance_manager.dto.CreateUserRequest;
import com.aditya.finance_manager.dto.UserResponse;
import com.aditya.finance_manager.entity.User;
import com.aditya.finance_manager.exception.UserAlreadyExistsException;
import com.aditya.finance_manager.mapper.UserMapper;
import com.aditya.finance_manager.repository.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;

    public UserService(
            UserRepository userRepository,
            UserMapper userMapper
    ) {
        this.userRepository = userRepository;
        this.userMapper = userMapper;
    }

    public UserResponse createUser(CreateUserRequest request) {

        if (userRepository.existsByEmailIgnoreCase(request.getEmail())) {
            throw new UserAlreadyExistsException(request.getEmail());
        }

        User user = userMapper.toEntity(request);

        User savedUser = userRepository.save(user);

        return userMapper.toResponse(savedUser);
    }
}