package com.taskflow.taskservice.config;

import java.security.Principal;

public record UserPrincipal(Long id, String username, String role) implements Principal {
    @Override
    public String getName() {
        return username;
    }
}
