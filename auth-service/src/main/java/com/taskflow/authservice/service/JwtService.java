package com.taskflow.authservice.service;

public interface JwtService {

    String generarToken(Long idUsuario, String username, String rol);

    String obtenerUsername(String token);

    boolean validarToken(String token);
}