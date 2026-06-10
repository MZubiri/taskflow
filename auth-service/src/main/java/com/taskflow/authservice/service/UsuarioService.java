package com.taskflow.authservice.service;

import com.taskflow.authservice.dto.LoginRequest;
import com.taskflow.authservice.dto.LoginResponse;
import com.taskflow.authservice.dto.UsuarioRequest;
import com.taskflow.authservice.dto.UsuarioResponse;

import java.util.List;

public interface UsuarioService {

    String registrar(UsuarioRequest request);

    LoginResponse login(LoginRequest request);

    List<UsuarioResponse> listarTodos();
}