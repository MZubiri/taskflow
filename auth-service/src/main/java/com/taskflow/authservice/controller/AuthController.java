package com.taskflow.authservice.controller;

import com.taskflow.authservice.dto.LoginRequest;
import com.taskflow.authservice.dto.LoginResponse;
import com.taskflow.authservice.dto.UsuarioRequest;
import com.taskflow.authservice.service.UsuarioService;
import com.taskflow.authservice.service.JwtService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UsuarioService usuarioService;
    private final JwtService jwtService;

    @PostMapping("/register")
    public String registrar(@Valid @RequestBody UsuarioRequest request) {
        return usuarioService.registrar(request);
    }

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest request) {
        return usuarioService.login(request);
    }
}