# 🍽️ Restaurant Reservation API

## 📋 Description

API REST para sistema de reservaciones de restaurante construida con [NestJS](https://github.com/nestjs/nest) framework, TypeScript, PostgreSQL y TypeORM.

### Características Principales

- 🔐 **Autenticación JWT** con roles y permisos
- 👥 **Gestión de usuarios** (Admin, Gerente, Cajero)
- 🏢 **Gestión de sucursales** y zonas
- 📅 **Sistema de reservaciones** con calendario
- 🔒 **Seguridad robusta** (Helmet, Rate Limiting, CORS)
- 📊 **Logging y auditoría** de eventos de seguridad
- ✅ **Validación estricta** de datos

---

## 🔒 Seguridad

Este proyecto implementa múltiples capas de seguridad para proteger la API:

- ✅ **Helmet** - Headers HTTP seguros (CSP, HSTS, X-Frame-Options)
- ✅ **Rate Limiting** - Protección contra ataques de fuerza bruta
- ✅ **CORS configurado** - Control de acceso entre dominios
- ✅ **Validación estricta** - Mass Assignment prevention
- ✅ **Logging de seguridad** - Auditoría de eventos críticos
- ✅ **Bcrypt** - Hash seguro de contraseñas
- ✅ **JWT** - Autenticación basada en tokens

📖 Para más detalles, consulta [SECURITY.md](./SECURITY.md)

---

## 🚀 Project setup

### Requisitos Previos

- Node.js >= 18
- PostgreSQL >= 14
- npm o yarn

### Instalación

```bash
# Instalar dependencias
$ npm install

# Configurar variables de entorno
$ cp .env.template .env
# Edita el archivo .env con tus configuraciones
```

### Configuración de Base de Datos

```bash
# Crear base de datos en PostgreSQL
$ createdb restaurant_reservations

# Las tablas se crean automáticamente con TypeORM (DB_SYNC=true en desarrollo)
```

---

## 🏃‍♂️ Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

La API estará disponible en `http://localhost:3000`

---

## 🧪 Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

---

## 📁 Estructura del Proyecto

```
src/
├── common/              # Utilidades compartidas
│   ├── decorators/      # Decoradores personalizados
│   ├── enums/           # Enumeraciones
│   ├── guards/          # Guards de autorización
│   └── interceptors/    # Interceptores (logging)
├── config/              # Configuraciones
├── modules/             # Módulos de la aplicación
│   ├── auth/            # Autenticación y autorización
│   ├── branches/        # Gestión de sucursales
│   ├── reservations/    # Sistema de reservaciones
│   ├── users/           # Gestión de usuarios
│   └── zones/           # Gestión de zonas
└── health/              # Health checks
```

---

## 🔑 Variables de Entorno

Copia `.env.template` a `.env` y configura:

```env
# Server
PORT=3000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=restaurant_reservations
DB_SYNC=false  # ⚠️ NUNCA usar 'true' en producción
DB_LOGGING=false

# JWT
JWT_SECRET=<tu-secreto-fuerte-aqui>
JWT_EXPIRES_IN=86400

# Security
CORS_ORIGIN=http://localhost:3000,http://localhost:4200
THROTTLE_SHORT_LIMIT=10
THROTTLE_MEDIUM_LIMIT=20
THROTTLE_LONG_LIMIT=100
```

---

## 🛡️ Auditoría de Seguridad

```bash
# Verificar vulnerabilidades en dependencias
$ npm audit

# Corregir vulnerabilidades
$ npm audit fix
```

---

## 📚 API Documentation

### Endpoints Principales

#### Auth

- `POST /auth/login` - Login de usuario
- `GET /auth/me` - Perfil del usuario actual

#### Users

- `GET /users` - Listar usuarios (Admin)
- `POST /users` - Crear usuario (Admin)
- `GET /users/:id` - Obtener usuario
- `PATCH /users/:id` - Actualizar usuario
- `DELETE /users/:id` - Eliminar usuario (Admin)

#### Branches

- `GET /branches` - Listar sucursales
- `POST /branches` - Crear sucursal (Admin)
- `GET /branches/:id` - Obtener sucursal
- `PATCH /branches/:id` - Actualizar sucursal
- `DELETE /branches/:id` - Eliminar sucursal (Admin)

#### Reservations

- `GET /reservations` - Listar reservaciones
- `POST /reservations` - Crear reservación
- `GET /reservations/:id` - Obtener reservación
- `PATCH /reservations/:id` - Actualizar reservación
- `DELETE /reservations/:id` - Cancelar reservación

---

## 🚀 Deployment

### Preparación para Producción

1. **Variables de entorno:**
   - `NODE_ENV=production`
   - `DB_SYNC=false`
   - `DB_LOGGING=false`
   - JWT_SECRET seguro (usar generador de secrets)

2. **HTTPS:**
   - Configurar certificados SSL/TLS
   - Usar reverse proxy (Nginx, Apache)

3. **Base de datos:**
   - Usar migraciones en lugar de sincronización
   - Configurar backups automáticos

4. **Monitoreo:**
   - Implementar logging centralizado
   - Configurar alertas

---

## 🤝 Support

Para preguntas y soporte:

- 📧 Email: [tu-email@dominio.com]
- 💬 Discord: [tu-servidor-discord]

---

## 👥 Team

Desarrollado por **DevCrafters Team**

---

## 📄 License

Este proyecto es privado y propietario.
