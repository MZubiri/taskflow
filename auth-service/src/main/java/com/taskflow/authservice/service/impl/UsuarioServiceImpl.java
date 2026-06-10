package com.taskflow.authservice.service.impl;

import com.taskflow.authservice.dto.LoginRequest;
import com.taskflow.authservice.dto.LoginResponse;
import com.taskflow.authservice.dto.UsuarioRequest;
import com.taskflow.authservice.dto.UsuarioResponse;
import com.taskflow.authservice.entity.Usuario;
import com.taskflow.authservice.repository.UsuarioRepository;
import com.taskflow.authservice.service.JwtService;
import com.taskflow.authservice.service.UsuarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UsuarioServiceImpl implements UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Override
    public String registrar(UsuarioRequest request) {
        if (usuarioRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new RuntimeException("El usuario ya existe");
        }

        String rol = request.getRol() != null ? request.getRol().toUpperCase() : "USER";
        if (!"ADMIN".equals(rol) && !"USER".equals(rol)) {
            rol = "USER";
        }

        Usuario usuario = Usuario.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .activo(true)
                .rol(rol)
                .build();

        usuarioRepository.save(usuario);

        return "Usuario registrado correctamente";
    }

    @Override
    public LoginResponse login(LoginRequest request) {
        Usuario usuario = usuarioRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("Usuario o contraseña incorrectos"));

        if (!passwordEncoder.matches(request.getPassword(), usuario.getPassword())) {
            throw new RuntimeException("Usuario o contraseña incorrectos");
        }

        if (!Boolean.TRUE.equals(usuario.getActivo())) {
            throw new RuntimeException("El usuario está inactivo");
        }

        String token = jwtService.generarToken(usuario.getId(), usuario.getUsername(), usuario.getRol());

        return new LoginResponse(token, "Bearer", usuario.getUsername());
    }

    @Override
    public List<UsuarioResponse> listarTodos() {
        return usuarioRepository.findAll().stream()
                .map(u -> UsuarioResponse.builder()
                        .id(u.getId())
                        .username(u.getUsername())
                        .rol(u.getRol())
                        .build())
                .toList();
    }
}