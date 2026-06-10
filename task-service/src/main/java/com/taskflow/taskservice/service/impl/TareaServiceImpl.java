package com.taskflow.taskservice.service.impl;

import com.taskflow.taskservice.config.UserPrincipal;
import com.taskflow.taskservice.dto.TareaRequest;
import com.taskflow.taskservice.dto.TareaResponse;
import com.taskflow.taskservice.entity.Tarea;
import com.taskflow.taskservice.repository.TareaRepository;
import com.taskflow.taskservice.service.TareaService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TareaServiceImpl implements TareaService {

    private final TareaRepository tareaRepository;

    private UserPrincipal obtenerPrincipalActual() {
        return (UserPrincipal) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }

    private boolean esAdmin(UserPrincipal principal) {
        return "ADMIN".equalsIgnoreCase(principal.role());
    }

    private void validarPropiedad(Tarea tarea, UserPrincipal principal) {
        if (!esAdmin(principal) && !tarea.getUsuarioId().equals(principal.id())) {
            throw new org.springframework.security.access.AccessDeniedException("No tienes permisos para acceder a esta tarea");
        }
    }

    @Override
    public TareaResponse crear(TareaRequest request) {
        UserPrincipal principal = obtenerPrincipalActual();
        Tarea tarea = Tarea.builder()
                .titulo(request.getTitulo())
                .descripcion(request.getDescripcion())
                .estado(request.getEstado())
                .usuarioId(principal.id())
                .fechaCreacion(LocalDateTime.now())
                .fechaActualizacion(LocalDateTime.now())
                .build();

        return convertirAResponse(tareaRepository.save(tarea));
    }

    @Override
    public List<TareaResponse> listar() {
        UserPrincipal principal = obtenerPrincipalActual();
        List<Tarea> tareas;
        if (esAdmin(principal)) {
            tareas = tareaRepository.findAll();
        } else {
            tareas = tareaRepository.findByUsuarioId(principal.id());
        }
        return tareas.stream()
                .map(this::convertirAResponse)
                .toList();
    }

    @Override
    public TareaResponse buscarPorId(Long id) {
        UserPrincipal principal = obtenerPrincipalActual();
        Tarea tarea = tareaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tarea no encontrada"));

        validarPropiedad(tarea, principal);

        return convertirAResponse(tarea);
    }

    @Override
    public TareaResponse actualizar(Long id, TareaRequest request) {
        UserPrincipal principal = obtenerPrincipalActual();
        Tarea tarea = tareaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tarea no encontrada"));

        validarPropiedad(tarea, principal);

        tarea.setTitulo(request.getTitulo());
        tarea.setDescripcion(request.getDescripcion());
        tarea.setEstado(request.getEstado());
        tarea.setFechaActualizacion(LocalDateTime.now());

        return convertirAResponse(tareaRepository.save(tarea));
    }

    @Override
    public void eliminar(Long id) {
        UserPrincipal principal = obtenerPrincipalActual();
        Tarea tarea = tareaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tarea no encontrada"));

        validarPropiedad(tarea, principal);

        tareaRepository.delete(tarea);
    }

    private TareaResponse convertirAResponse(Tarea tarea) {
        return TareaResponse.builder()
                .id(tarea.getId())
                .titulo(tarea.getTitulo())
                .descripcion(tarea.getDescripcion())
                .estado(tarea.getEstado())
                .fechaCreacion(tarea.getFechaCreacion())
                .fechaActualizacion(tarea.getFechaActualizacion())
                .build();
    }
}