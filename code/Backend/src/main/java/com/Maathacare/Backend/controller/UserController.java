package com.Maathacare.Backend.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.interceptor.TransactionAspectSupport;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.Maathacare.Backend.dto.AuthRequest;
import com.Maathacare.Backend.dto.AuthResponse;
import com.Maathacare.Backend.dto.UserRegistrationRequest;
import com.Maathacare.Backend.model.entity.MotherProfile;
import com.Maathacare.Backend.model.entity.PHMProfile;
import com.Maathacare.Backend.model.entity.User;
import com.Maathacare.Backend.model.enums.Role;
import com.Maathacare.Backend.repository.MotherProfileRepository;
import com.Maathacare.Backend.repository.PHMProfileRepository;
import com.Maathacare.Backend.repository.UserRepository;
import com.Maathacare.Backend.security.JwtService;
import com.Maathacare.Backend.service.UserService;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MotherProfileRepository motherProfileRepository;

    @Autowired
    private PHMProfileRepository phmProfileRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private UserService userService;

    // ----------------------------------------------------
    // MOTHER ENDPOINTS
    // ----------------------------------------------------

    @PostMapping("/register")
    @Transactional
    public ResponseEntity<?> register(
            @RequestBody UserRegistrationRequest request
    ) {

        try {

            // ------------------------------------------------
            // BASIC REQUEST VALIDATION
            // ------------------------------------------------

            if (request == null) {
                return ResponseEntity
                        .badRequest()
                        .body("Registration request is missing.");
            }

            String phoneNumber =
                    request.getPhoneNumber() == null
                            ? ""
                            : request.getPhoneNumber().trim();

            String password =
                    request.getPassword() == null
                            ? ""
                            : request.getPassword().trim();

            String fullName =
                    request.getFullName() == null
                            ? ""
                            : request.getFullName().trim();

            String nic =
                    request.getNic() == null
                            ? ""
                            : request.getNic().trim();

            String address =
                    request.getAddress() == null
                            ? ""
                            : request.getAddress().trim();

            String emergencyContact =
                    request.getEmergencyContactNumber() == null
                            ? ""
                            : request
                            .getEmergencyContactNumber()
                            .trim();

            String district =
                    request.getDistrict() == null
                            ? ""
                            : request.getDistrict().trim();

            String province =
                    request.getProvince() == null
                            ? ""
                            : request.getProvince().trim();

            String residentialDivision =
                    request.getResidentialDivision() == null
                            ? ""
                            : request
                            .getResidentialDivision()
                            .trim();

            String gnDivision =
                    request.getGnDivision() == null
                            ? ""
                            : request.getGnDivision().trim();

            // ------------------------------------------------
            // REQUIRED FIELDS
            // ------------------------------------------------

            if (phoneNumber.isEmpty()) {
                return ResponseEntity
                        .badRequest()
                        .body("Phone number is required.");
            }

            if (password.isEmpty()) {
                return ResponseEntity
                        .badRequest()
                        .body("Password is required.");
            }

            if (fullName.isEmpty()) {
                return ResponseEntity
                        .badRequest()
                        .body("Full name is required.");
            }

            if (nic.isEmpty()) {
                return ResponseEntity
                        .badRequest()
                        .body("NIC is required.");
            }

            if (address.isEmpty()) {
                return ResponseEntity
                        .badRequest()
                        .body("Address is required.");
            }

            if (emergencyContact.isEmpty()) {
                return ResponseEntity
                        .badRequest()
                        .body("Emergency contact number is required.");
            }

            if (request.getBloodGroup() == null
                    || request.getBloodGroup().trim().isEmpty()) {

                return ResponseEntity
                        .badRequest()
                        .body("Blood group is required.");
            }

            if (province.isEmpty()) {
                return ResponseEntity
                        .badRequest()
                        .body("Province is required.");
            }

            if (district.isEmpty()) {
                return ResponseEntity
                        .badRequest()
                        .body("District is required.");
            }

            if (residentialDivision.isEmpty()) {
                return ResponseEntity
                        .badRequest()
                        .body("MOH Area is required.");
            }

            if (gnDivision.isEmpty()) {
                return ResponseEntity
                        .badRequest()
                        .body("GN Division is required.");
            }

            // ------------------------------------------------
            // PHONE FORMAT
            // ------------------------------------------------

            if (!phoneNumber.matches("^0\\d{9}$")) {
                return ResponseEntity
                        .badRequest()
                        .body(
                                "Phone number must contain "
                                        + "10 digits and begin with 0."
                        );
            }

            // ------------------------------------------------
            // CHECK EXISTING PHONE NUMBER
            // ------------------------------------------------

            if (userRepository
                    .findById(phoneNumber)
                    .isPresent()) {

                return ResponseEntity
                        .status(HttpStatus.CONFLICT)
                        .body(
                                "Phone number already registered."
                        );
            }

            // ------------------------------------------------
            // CREATE USER ACCOUNT
            // ------------------------------------------------

            User newUser = new User();

            newUser.setUserId(phoneNumber);

            newUser.setPasswordHash(
                    passwordEncoder.encode(password)
            );

            newUser.setRole(Role.MOTHER);
            newUser.setActive(true);

            User savedUser =
                    userRepository.save(newUser);

            // ------------------------------------------------
            // CREATE MOTHER PROFILE
            // ------------------------------------------------

            MotherProfile profile =
                    new MotherProfile();

            profile.setUser(savedUser);

            profile.setFullName(fullName);

            profile.setNic(nic);

            profile.setDateOfBirth(
                    request.getDateOfBirth()
            );

            profile.setAddress(address);

            profile.setEmergencyContactNumber(
                    emergencyContact
            );

            profile.setBloodGroup(
                    request.getBloodGroup().trim()
            );

            profile.setLastMenstrualPeriod(
                    request.getLastMenstrualPeriod()
            );

            profile.setDistrict(district);

            profile.setProvince(province);

            profile.setResidentialDivision(
                    residentialDivision
            );

            profile.setGnDivision(
                    gnDivision
            );

            // ------------------------------------------------
            // PHM ASSIGNMENT
            // ------------------------------------------------
            //
            // IMPORTANT:
            //
            // A GN Division may contain more than one PHM.
            //
            // The old code used:
            //
            // Optional<PHMProfile> findByGnDivision(...)
            //
            // which crashes if more than one PHM exists.
            //
            // We now retrieve ALL matching PHMs.
            // ------------------------------------------------

            List<PHMProfile> matchingPhms =
                    phmProfileRepository
                            .findAllByGnDivision(
                                    gnDivision
                            );

            if (!matchingPhms.isEmpty()) {

                /*
                 * Temporary assignment policy:
                 *
                 * If multiple PHMs serve the same GN Division,
                 * assign the first available PHM returned by
                 * the repository.
                 *
                 * This prevents registration from failing.
                 *
                 * Later this can be replaced with:
                 * - workload balancing
                 * - explicit PHM selection
                 * - catchment/sub-area assignment
                 */
                PHMProfile assignedPhm =
                        matchingPhms.get(0);

                profile.setPhmProfile(
                        assignedPhm
                );

                System.out.println(
                        "Mother assigned to PHM: "
                                + assignedPhm
                                .getUser()
                                .getStaffId()
                                + " | GN Division: "
                                + gnDivision
                );

            } else {

                /*
                 * Mother registration is still allowed
                 * even when no PHM is currently registered
                 * for the GN Division.
                 */

                System.out.println(
                        "No PHM found for GN Division: "
                                + gnDivision
                                + ". Mother will remain "
                                + "temporarily unassigned."
                );
            }

            // ------------------------------------------------
            // SAVE MOTHER PROFILE
            // ------------------------------------------------

            motherProfileRepository.save(profile);

            // ------------------------------------------------
            // SUCCESS
            // ------------------------------------------------

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(
                            "Mother Account and Profile created!"
                    );

        } catch (Exception e) {

            /*
             * Because the User is saved before the MotherProfile,
             * any unexpected failure must roll back the entire
             * registration transaction.
             */

            TransactionAspectSupport
                    .currentTransactionStatus()
                    .setRollbackOnly();

            e.printStackTrace();

            return ResponseEntity
                    .status(
                            HttpStatus.INTERNAL_SERVER_ERROR
                    )
                    .body(
                            "Error: " + e.getMessage()
                    );
        }
    }

    // ----------------------------------------------------
    // MOTHER LOGIN ENDPOINT
    // ----------------------------------------------------

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody Map<String, String> requestData
    ) {

        try {

            String phone =
                    requestData
                            .get("phoneNumber")
                            .trim();

            String password =
                    requestData.get("password");

            return ResponseEntity.ok(
                    userService.loginUser(
                            phone,
                            password
                    )
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(
                            e.getMessage()
                    );
        }
    }

    // ----------------------------------------------------
    // STAFF LOGIN ENDPOINT
    // ----------------------------------------------------

    @PostMapping("/staff/login")
    public ResponseEntity<?> staffLogin(
            @RequestBody AuthRequest request
    ) {

        if (
                request == null
                        || request.getStaffId() == null
                        || request
                        .getStaffId()
                        .trim()
                        .isEmpty()
                        || request.getPassword() == null
                        || request
                        .getPassword()
                        .isEmpty()
        ) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            "Staff ID and password are required."
                    );
        }

        String staffId =
                request
                        .getStaffId()
                        .trim();

        User user =
                userRepository
                        .findByStaffId(staffId)
                        .orElse(null);

        if (user == null) {

            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(
                            "Staff ID not found."
                    );
        }

        if (user.getRole() == Role.MOTHER) {

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(
                            "Access denied."
                    );
        }

        if (Boolean.FALSE.equals(
                user.getActive()
        )) {

            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(
                            "This staff account is inactive."
                    );
        }

        if (
                !passwordEncoder.matches(
                        request.getPassword(),
                        user.getPasswordHash()
                )
        ) {

            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(
                            "Invalid credentials."
                    );
        }

        return ResponseEntity.ok(
                new AuthResponse(
                        jwtService.generateToken(user),
                        user.getRole().name()
                )
        );
    }

    // ----------------------------------------------------
    // SETUP AND TESTING ENDPOINTS
    // ----------------------------------------------------

    @GetMapping("/admin/setup")
    public ResponseEntity<String>
    setupMasterAdmin() {

        if (
                userRepository
                        .findByStaffId(
                                "ADMIN-MASTER"
                        )
                        .isPresent()
        ) {

            return ResponseEntity.ok(
                    "Master Admin already exists!"
            );
        }

        User admin =
                new User();

        admin.setUserId(
                "ADMIN-MASTER"
        );

        admin.setStaffId(
                "ADMIN-MASTER"
        );

        admin.setPasswordHash(
                passwordEncoder.encode(
                        "admin123"
                )
        );

        admin.setRole(
                Role.ADMIN
        );

        admin.setActive(
                true
        );

        userRepository.save(
                admin
        );

        return ResponseEntity.ok(
                "Master Admin Created! "
                        + "ID: ADMIN-MASTER | "
                        + "Password: admin123"
        );
    }

    @GetMapping("/staff/create-test")
    public ResponseEntity<String>
    createTestStaff() {

        if (
                userRepository
                        .findByStaffId(
                                "PHM-100"
                        )
                        .isPresent()
        ) {

            return ResponseEntity.ok(
                    "Test Midwife already exists!"
            );
        }

        User testStaff =
                new User();

        testStaff.setUserId(
                "999999999V"
        );

        testStaff.setStaffId(
                "PHM-100"
        );

        testStaff.setPasswordHash(
                passwordEncoder.encode(
                        "password123"
                )
        );

        testStaff.setRole(
                Role.PHM
        );

        testStaff.setActive(
                true
        );

        User savedUser =
                userRepository.save(
                        testStaff
                );

        PHMProfile profile =
                new PHMProfile();

        profile.setUser(
                savedUser
        );

        profile.setFullName(
                "Test Midwife"
        );

        profile.setRegistrationNumber(
                "PHM-100"
        );

        profile.setMohArea(
                "Colombo MC"
        );

        profile.setGnDivision(
                "Borella North"
        );

        phmProfileRepository.save(
                profile
        );

        return ResponseEntity.ok(
                "Test Midwife and Profile Created! "
                        + "Assigned to GN Division: "
                        + "Borella North"
        );
    }

    // ----------------------------------------------------
    // SECURITY ENDPOINTS
    // ----------------------------------------------------

    @CrossOrigin(origins = "*")
    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(
            @RequestBody Map<String, String> request
    ) {

        try {

            String userId =
                    request.get(
                            "userId"
                    );

            String oldPassword =
                    request.get(
                            "oldPassword"
                    );

            String newPassword =
                    request.get(
                            "newPassword"
                    );

            User user =
                    userRepository
                            .findByUserId(
                                    userId
                            )
                            .orElseGet(
                                    () ->
                                            userRepository
                                                    .findByStaffId(
                                                            userId
                                                    )
                                                    .orElse(null)
                            );

            if (user == null) {

                return ResponseEntity
                        .status(
                                HttpStatus.NOT_FOUND
                        )
                        .body(
                                "User not found."
                        );
            }

            if (
                    !passwordEncoder.matches(
                            oldPassword,
                            user.getPasswordHash()
                    )
            ) {

                return ResponseEntity
                        .status(
                                HttpStatus.BAD_REQUEST
                        )
                        .body(
                                "Incorrect current password."
                        );
            }

            user.setPasswordHash(
                    passwordEncoder.encode(
                            newPassword
                    )
            );

            userRepository.save(
                    user
            );

            return ResponseEntity.ok(
                    "Password successfully updated!"
            );

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(
                            HttpStatus.INTERNAL_SERVER_ERROR
                    )
                    .body(
                            "Error updating password: "
                                    + e.getMessage()
                    );
        }
    }

    // ----------------------------------------------------
    // PUSH NOTIFICATION ENDPOINT
    // ----------------------------------------------------

    @PutMapping("/{userId}/push-token")
    public ResponseEntity<?> updatePushToken(
            @PathVariable String userId,
            @RequestBody Map<String, String> request
    ) {

        try {

            String pushToken =
                    request.get(
                            "pushToken"
                    );

            if (
                    pushToken == null
                            || pushToken.isBlank()
            ) {

                return ResponseEntity
                        .badRequest()
                        .body(
                                "Push token is required."
                        );
            }

            System.out.println(
                    "PUSH TOKEN ENDPOINT REACHED"
            );

            System.out.println(
                    "User ID: "
                            + userId
            );

            System.out.println(
                    "Push token: "
                            + pushToken
            );

            userService.updatePushToken(
                    userId,
                    pushToken
            );

            return ResponseEntity.ok(
                    "Push token updated successfully."
            );

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .status(
                            HttpStatus.INTERNAL_SERVER_ERROR
                    )
                    .body(
                            "Error saving push token: "
                                    + e.getMessage()
                    );
        }
    }
}