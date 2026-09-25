package com.Maathacare.Backend.repository;

import com.Maathacare.Backend.model.entity.PHMProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PHMProfileRepository extends JpaRepository<PHMProfile, String> {

    // Find PHM by linked user ID
    Optional<PHMProfile> findByUserUserId(String userId);

    // Find PHM by staff ID
    Optional<PHMProfile> findByUserStaffId(String staffId);

    // Existing MOH-area lookup
    Optional<PHMProfile> findByMohArea(String mohArea);

    /*
     * Multiple PHMs can belong to the same GN Division.
     *
     * Therefore this MUST return a List instead of Optional.
     * Returning Optional caused:
     *
     * "Query did not return a unique result: 2 results were returned"
     */
    List<PHMProfile> findAllByGnDivision(String gnDivision);
}