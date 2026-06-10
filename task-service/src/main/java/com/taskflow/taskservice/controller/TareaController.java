package com.taskflow.taskservice.controller;

import com.taskflow.taskservice.dto.TareaRequest;
import com.taskflow.taskservice.dto.TareaResponse;
import com.taskflow.taskservice.service.TareaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tareas")
@RequiredArgsConstructor
public class TareaController {

    private final TareaService tareaService;

    @PostMapping
    public TareaResponse crear(@Valid @RequestBody TareaRequest request) {
        return tareaService.crear(request);
    }

    @GetMapping
    public List<TareaResponse> listar() {
        return tareaService.listar();
    }

    @GetMapping("/{id}")
    public TareaResponse buscarPorId(@PathVariable Long id) {
        return tareaService.buscarPorId(id);
    }

    @PutMapping("/{id}")
    public TareaResponse actualizar(@PathVariable Long id, @Valid @RequestBody TareaRequest request) {
        return tareaService.actualizar(id, request);
    }

    @DeleteMapping("/{id}")
    public void eliminar(@PathVariable Long id) {
        tareaService.eliminar(id);
    }
}