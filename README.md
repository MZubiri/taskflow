# TaskFlow - Sistema de Gestión de Tareas (Microservicios)

Este proyecto consiste en un ecosistema de microservicios distribuido para la gestión de tareas individuales, con autenticación segura por roles (Usuario y Administrador) y base de datos relacional independiente. Desarrollado como proyecto final para el curso de **Desarrollo de Servicios Web II**.

---

## 1. Arquitectura del Sistema

El sistema está diseñado bajo una arquitectura de microservicios distribuidos, utilizando las herramientas de **Spring Cloud** y **Netflix OSS**:

```
                  [ CLIENTE / POSTMAN ]
                            │
                            ▼ (Puerto 8080)
                     ┌──────────────┐
                     │ api-gateway  │ <─── Consulta direcciones
                     └──────────────┘
                       │          │
        ┌──────────────┘          └──────────────┐
        ▼ (Ruta: /api/auth/**)                   ▼ (Ruta: /api/tareas/**)
┌────────────────┐                       ┌────────────────┐
│  auth-service  │                       │  task-service  │
│ (Puerto 8081)  │                       │ (Puerto 8082)  │
└────────────────┘                       └────────────────┘
        │ (Se registra en)                       │ (Se registra en)
        │                                        │
        └──────────────┐          ┌──────────────┘
                       ▼          ▼
                     ┌──────────────┐
                     │  discovery   │ (Eureka Server - Puerto 8761)
                     │   (dir. de   │
                     │  servicios)  │
                     └──────────────┘
```

### Componentes:
1. **`discovery-server` (Puerto 8761)**: Servidor de descubrimiento de servicios con **Netflix Eureka**. Mantiene el registro dinámico de todos los microservicios activos.
2. **`api-gateway` (Puerto 8080)**: Entrada única al sistema con **Spring Cloud Gateway**. Enruta las peticiones de forma dinámica utilizando nombres de servicio balanceados (`lb://`).
3. **`auth-service` (Puerto 8081)**: Microservicio encargado de la gestión de usuarios, cifrado de contraseñas con BCrypt, inicio de sesión y generación de Tokens **JWT** con claims de seguridad (`idUsuario` y `rol`).
4. **`task-service` (Puerto 8082)**: Microservicio encargado del CRUD de tareas. Protegido mediante un filtro de seguridad stateless que valida las firmas de los tokens JWT entrantes.

---

## 2. Tecnologías Empleadas

* **Lenguaje**: Java 21
* **Framework**: Spring Boot 3.4.0 / 3.5.x
* **Ecosistema**: Spring Cloud (Gateway, Eureka Discovery, LoadBalancer)
* **Seguridad**: Spring Security y JSON Web Tokens (JWT) con librería `jjwt` (v0.12.6)
* **Base de Datos**: MySQL 8.0 (Corriendo en Docker)
* **ORM**: Spring Data JPA / Hibernate
* **Pruebas**: Postman

---

## 3. Seguridad e Integración de Roles

El sistema implementa seguridad basada en Tokens JWT sin estado (stateless):
* **`ROLE_USER` (Usuario Común)**:
  * Solo puede ver, crear, editar y eliminar las tareas asociadas a su `usuarioId`.
  * La pertenencia de la tarea se extrae de forma automática del token JWT firmado en la petición.
* **`ROLE_ADMIN` (Administrador)**:
  * Posee facultades globales de auditoría. Puede listar, buscar, actualizar o eliminar las tareas de **todos** los usuarios en el sistema.

---

## 4. Requisitos Previos

1. Tener instalado **Java 21**.
2. Contar con un contenedor de **MySQL** activo. El proyecto está configurado para conectarse al puerto local **`5510`** (con usuario `root` y contraseña `admindb`).
   * *Nota: Las bases de datos `taskflow_auth` y `taskflow_tasks` se crearán de forma automática en tu MySQL en el primer arranque gracias a `createDatabaseIfNotExist=true`.*

---

## 5. Instrucciones de Ejecución

Abre cuatro pestañas en tu terminal y ejecuta los siguientes comandos en orden:

### Paso 1: Levantar el Servidor de Descubrimiento (Eureka)
```bash
cd discovery-server
./mvnw spring-boot:run
```
*Espera a que el servidor inicialice en el puerto `8761`. Puedes verificar la consola gráfica ingresando a `http://localhost:8761`.*

### Paso 2: Levantar el Servicio de Autenticación
```bash
cd auth-service
./mvnw spring-boot:run
```

### Paso 3: Levantar el Servicio de Tareas
```bash
cd task-service
./mvnw spring-boot:run
```

### Paso 4: Levantar el API Gateway
```bash
cd api-gateway
./mvnw spring-boot:run
```

---

## 6. Pruebas y Validación (Postman)

Se ha preparado una colección de Postman oficial llamada `taskflow.postman_collection.json` en la raíz del directorio de proyectos.

### Pasos para realizar pruebas:
1. Importa el archivo [taskflow.postman_collection.json](./taskflow.postman_collection.json) en Postman.
2. Ejecuta la petición **"Registrar Usuario Común"** o **"Registrar Administrador"** para guardar cuentas de prueba.
3. Ejecuta la petición **"Iniciar Sesión (Obtener JWT)"**. El script de test de Postman guardará automáticamente el token retornado en las variables globales.
4. Ejecuta las peticiones de la carpeta **"Tareas"** (Crear, Listar, Actualizar, Borrar). Verás que la autenticación Bearer ya está configurada para inyectar el token guardado.
