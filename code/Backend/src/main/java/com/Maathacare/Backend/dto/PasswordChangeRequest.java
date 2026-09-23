package com.Maathacare.Backend.dto;

public class PasswordChangeRequest {
    private String oldPassword;
    private String newPassword;

    // Getters
    public String getOldPassword() {
        return oldPassword;
    }

    public String getNewPassword() {
        return newPassword;
    }

    // Setters
    public void setOldPassword(String oldPassword) {
        this.oldPassword = oldPassword;
    }

    public void setNewPassword(String newPassword) {
        this.newPassword = newPassword;
    }
}