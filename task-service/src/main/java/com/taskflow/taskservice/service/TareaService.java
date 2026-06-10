package com.taskflow.taskservice.service;

import com.taskflow.taskservice.dto.TareaRequest;
import com.taskflow.taskservice.dto.TareaResponse;

import java.util.List;

public interface TareaService {

    TareaResponse crear(TareaRequest request);

    List<TareaResponse> listar();

    TareaResponse buscarPorId(Long id);

    TareaResponse actualizar(Long id, TareaRequest request);

    void eliminar(Long id);
}