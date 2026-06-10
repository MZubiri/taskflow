package com.taskflow.authservice.service;

import com.taskflow.authservice.dto.LoginRequest;
import com.taskflow.authservice.dto.LoginResponse;
import com.taskflow.authservice.dto.UsuarioRequest;

public interface UsuarioService {

    String registrar(UsuarioRequest request);

    LoginResponse login(LoginRequest request);
}