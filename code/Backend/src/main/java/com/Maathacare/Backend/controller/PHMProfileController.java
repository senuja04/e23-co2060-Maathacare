package com.Maathacare.Backend.controller;

import com.Maathacare.Backend.dto.PHMProfileRequest;
import com.Maathacare.Backend.dto.PasswordChangeRequest;
import com.Maathacare.Backend.model.entity.MotherProfile;
import com.Maathacare.Backend.model.entity.PHMProfile;
import com.Maathacare.Backend.repository.MotherProfileRepository; // 🟢 ADD THIS
import com.Maathacare.Backend.service.PHMProfileService;
import com.Maathacare.Backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired; // 🟢 ADD THIS
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.Maathacare.Backend.service.StorageService;

import java.util.List;

@RestController
@RequestMapping("/api/phm")
public class PHMProfileController {

    private final PHMProfileService phmProfileService;
    private final StorageService storageService;

    public PHMProfileController(PHMProfileService phmProfileService, StorageService storageService) {
        this.phmProfileService = phmProfileService;
        this.storageService = storageService;
    }

    /**
     * Endpoint for initial test setup of PHM profiles.
     */
    @PostMapping("/setup")
    public ResponseEntity<String> setupProfile(@RequestBody PHMProfileRequest request) {
        try {
            PHMProfile profile = phmProfileService.createPHMProfile(request);
            return ResponseEntity.ok("Success! PHM Profile linked for: " + profile.getFullName());
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * 🔒 SECURE ENDPOINT: Fetches the real list of mothers assigned to the logged-in PHM.
     * Replaces the dummy string list with actual MotherProfile entities.
     */
    @GetMapping("/patients")
    public ResponseEntity<List<MotherProfile>> getMyPatients() {
        // 🟢 Calling the real service logic
        List<MotherProfile> patients = phmProfileService.getMyPatients();
        return ResponseEntity.ok(patients);
    }

    /**
     * 🔒 SECURE ENDPOINT: Fetches the personal profile details of the logged-in PHM.
     */
    @GetMapping("/me")
    public ResponseEntity<PHMProfile> getCurrentPHMProfile() {
        // 🟢 Matching the method name in your Service (getMyProfile)
        PHMProfile profile = phmProfileService.getMyProfile();
        return ResponseEntity.ok(profile);
    }

    @PutMapping("/update-profile-picture")
    public ResponseEntity<?> updateProfilePicture(@RequestParam("file") MultipartFile file) {
        try {
            PHMProfile profile = phmProfileService.getMyProfile();
            String publicUrl = storageService.uploadAvatar(file, "phm", profile.getUser().getUserId());
            profile.setProfilePictureUrl(publicUrl);
            phmProfileService.save(profile);
            return ResponseEntity.ok(java.util.Map.of(
                    "message", "Profile picture updated successfully",
                    "profilePictureUrl", publicUrl));
        } catch (IllegalArgumentException exception) {
            return ResponseEntity.badRequest().body(exception.getMessage());
        } catch (Exception exception) {
            return ResponseEntity.internalServerError().body("Failed to upload profile picture.");
        }
    }
    // Inside PHMProfileController.java
    @Autowired
    private MotherProfileRepository motherProfileRepository;

    @PutMapping("/assign-mother/{nic}")
    public ResponseEntity<?> assignMotherToMe(@PathVariable String nic) {
        try {
            // 1. Identify the logged-in PHM
            PHMProfile phm = phmProfileService.getMyProfile(); // This uses your existing logic

            // 2. Find the Mother by NIC
            MotherProfile mother = motherProfileRepository.findByNic(nic)
                    .orElseThrow(() -> new RuntimeException("No registered mother found with NIC: " + nic));

            // 3. Link the PHM to the Mother
            mother.setPhmProfile(phm);
            motherProfileRepository.save(mother);

            return ResponseEntity.ok("Assigned successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    @PutMapping("/profile/{userId}")
    public ResponseEntity<?> updatePHMProfile(@PathVariable String userId, @RequestBody PHMProfileRequest request) {
        try {
            PHMProfile updatedProfile = phmProfileService.updatePhmProfile(userId, request);
            return ResponseEntity.ok(updatedProfile);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body("Failed to update PHM profile: " + e.getMessage());
        }
    }
    @Autowired
    private UserService userService;

    @PutMapping("/change-password/{userId}")
    public ResponseEntity<?> changePassword(
            @PathVariable String userId,
            @RequestBody PasswordChangeRequest request) {
        try {
            // Authenticated check ensures the PHM can only change their own password
            String authenticatedUserId = SecurityContextHolder.getContext().getAuthentication().getName();
            if (!authenticatedUserId.equals(userId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You can only change your own password.");
            }

            userService.updatePassword(userId, request.getOldPassword(), request.getNewPassword());
            return ResponseEntity.ok("Password updated successfully.");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }

    }

}
