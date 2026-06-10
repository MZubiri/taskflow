package com.taskflow.taskservice.service;

public interface JwtService {

    String obtenerUsername(String token);

    Long obtenerUsuarioId(String token);

    String obtenerRol(String token);

    boolean validarToken(String token);
}