# Sistema de Gestión de Tareas - Arquitectura de Microservicios

## Descripción General

Este proyecto fue desarrollado utilizando Java y Spring Boot siguiendo una arquitectura basada en microservicios.

El sistema está compuesto por dos servicios independientes:

### Auth Service

Responsable de la autenticación y gestión de usuarios.

Funciones principales:

* Registro de usuarios.
* Inicio de sesión.
* Cifrado de contraseñas mediante BCrypt.
* Generación de tokens JWT.
* Persistencia de usuarios en PostgreSQL.

Puerto:

```text
8081
```

Base de datos:

```text
taskflow_auth
```

---

### Task Service

Responsable de la gestión de tareas.

Funciones principales:

* Registro de tareas.
* Consulta de tareas.
* Actualización de tareas.
* Eliminación de tareas.
* Protección de endpoints mediante JWT.

Puerto:

```text
8082
```

Base de datos:

```text
taskflow_tasks
```

---

# Tecnologías Utilizadas

* Java 21
* Spring Boot 3.5.15
* Spring Data JPA
* Spring Security
* PostgreSQL
* Hibernate
* Lombok
* Maven
* JWT (JSON Web Token)
* Postman
* Git y GitHub

---

# Arquitectura

```text
┌─────────────────────┐
│      Postman        │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│    Auth Service     │
│      :8081          │
└──────────┬──────────┘
           │
      Genera JWT
           │
           ▼
┌─────────────────────┐
│    Task Service     │
│      :8082          │
└──────────┬──────────┘
           │
           ▼
      PostgreSQL
```

---

# Requisitos Previos

Instalar:

* Java JDK 21
* PostgreSQL
* Git
* IntelliJ IDEA
* Maven (opcional, incluido mediante Maven Wrapper)

Verificar instalación:

```bash
java -version
```

Debe mostrar:

```text
21.x.x
```

---

# Configuración de Base de Datos

Ingresar a PostgreSQL:

```bash
sudo -u postgres psql
```

Crear base de datos para autenticación:

```sql
CREATE DATABASE taskflow_auth;

CREATE USER taskflow_user
WITH PASSWORD 'Taskflow123*';

ALTER DATABASE taskflow_auth
OWNER TO taskflow_user;
```

Crear base de datos para tareas:

```sql
CREATE DATABASE taskflow_tasks;

CREATE USER taskflow_tasks_user
WITH PASSWORD 'Taskflow123*';

ALTER DATABASE taskflow_tasks
OWNER TO taskflow_tasks_user;
```

Salir:

```sql
\q
```

---

# Configuración de Auth Service

Archivo:

```text
src/main/resources/application.properties
```

```properties
spring.application.name=auth-service

server.port=8081

spring.datasource.url=jdbc:postgresql://localhost:5432/taskflow_auth
spring.datasource.username=taskflow_user
spring.datasource.password=Taskflow123*

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true

jwt.secret=MiClaveSuperSecretaParaTaskFlowAuthService2026DebeSerLarga
jwt.expiration=3600000
```

---

# Configuración de Task Service

Archivo:

```text
src/main/resources/application.properties
```

```properties
spring.application.name=task-service

server.port=8082

spring.datasource.url=jdbc:postgresql://localhost:5432/taskflow_tasks
spring.datasource.username=taskflow_tasks_user
spring.datasource.password=Taskflow123*

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true

jwt.secret=MiClaveSuperSecretaParaTaskFlowAuthService2026DebeSerLarga
```

---

# Ejecución del Proyecto

Clonar repositorio:

```bash
git clone <URL_REPOSITORIO>
```

Entrar al proyecto:

```bash
cd auth-service
```

Ejecutar:

```bash
./mvnw spring-boot:run
```

Hacer lo mismo para:

```bash
cd task-service
```

---

# Endpoints de Auth Service

## Registrar Usuario

```http
POST /api/auth/register
```

Body:

```json
{
  "username": "guss",
  "password": "123456"
}
```

---

## Login

```http
POST /api/auth/login
```

Body:

```json
{
  "username": "guss",
  "password": "123456"
}
```

Respuesta:

```json
{
  "token": "JWT_TOKEN",
  "tokenType": "Bearer",
  "username": "guss"
}
```

---

# Endpoints de Task Service

## Crear Tarea

```http
POST /api/tareas
```

## Listar Tareas

```http
GET /api/tareas
```

## Buscar Tarea por ID

```http
GET /api/tareas/{id}
```

## Actualizar Tarea

```http
PUT /api/tareas/{id}
```

## Eliminar Tarea

```http
DELETE /api/tareas/{id}
```

---

# Seguridad

El sistema utiliza JWT para la autenticación.

Flujo:

1. El usuario se registra.
2. El usuario inicia sesión.
3. Auth Service genera un JWT.
4. El cliente envía el JWT en cada petición.
5. Task Service valida el JWT antes de permitir el acceso.

Ejemplo:

```http
Authorization: Bearer eyJhbGciOi...
```

---

# Autor

Proyecto desarrollado para el curso Desarrollo de Servicios Web II (DSWII).

