package com.Maathacare.Backend.service;

import com.Maathacare.Backend.dto.AuthResponse;
import com.Maathacare.Backend.model.entity.User;
import com.Maathacare.Backend.model.enums.Role;
import com.Maathacare.Backend.repository.UserRepository;
import com.Maathacare.Backend.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService; // We added the Token Factory!

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public User registerNewUser(String userId, String password, Role role) {
        if (userRepository.findByUserId(userId).isPresent()) {
            throw new RuntimeException("This phone number is already registered!");
        }

        User newUser = new User();
        newUser.setUserId(userId);
        newUser.setPasswordHash(passwordEncoder.encode(password));
        newUser.setRole(Role.MOTHER);

        newUser.setActive(true);

        return userRepository.save(newUser);
    }

    // NEW: The Login Engine
    public AuthResponse loginUser(String identifier, String password) {
        // Check if identifier is a Phone (Mother) OR Staff ID
        User user = userRepository.findByUserId(identifier)
                .orElseGet(() -> userRepository.findByStaffId(identifier)
                        .orElseThrow(() -> new RuntimeException("User not found: " + identifier)));

        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            throw new RuntimeException("Invalid credentials!");
        }

        String token = jwtService.generateToken(user);
        return new AuthResponse(token, user.getRole().name());
    }
    public void updatePushToken(String userId, String pushToken) {
        User user = userRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));

        user.setPushToken(pushToken);
        userRepository.save(user);
    }
    public void updatePassword(String userId, String oldPassword, String newPassword) {
        User user = userRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Verify old password (assuming you have a passwordEncoder bean)
        if (!passwordEncoder.matches(oldPassword, user.getPasswordHash())) {
            throw new RuntimeException("Current password does not match.");
        }

        // Update and encode new password
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }
}