# Solaris E-Commerce

Plataforma modular de e-commerce integrable con el ecosistema Solaris. Este proyecto sirve como "esqueleto" o template para crear tiendas online personalizadas que pueden funcionar de forma autónoma o integrarse con el sistema Solaris.

## 🏗️ Arquitectura

El proyecto está dividido en dos módulos principales:

### Backend (solaris-ecommerce-api)
- **Framework**: Spring Boot 3.5.14
- **Java Version**: 21
- **Base de datos**: PostgreSQL
- **Migraciones**: Flyway
- **Autenticación**: JWT + Spring Security
- **Caché**: Redis (opcional)
- **Documentación**: SpringDoc OpenAPI (Swagger)

### Frontend (solaris-ecommerce-web)
- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite
- **Estilos**: TailwindCSS
- **State Management**: TanStack Query
- **Routing**: React Router
- **HTTP Client**: Axios

## 📋 Requisitos Previos

- Java 21+
- Node.js 18+
- PostgreSQL 14+
- Maven 3.8+
- Redis (opcional, para caché)

## 🚀 Instalación y Configuración

### 1. Clonar el proyecto
```bash
cd C:\Users\Usuario\Projects\solaris-e-commerce
```

### 2. Configurar Base de Datos PostgreSQL
```sql
CREATE DATABASE solaris_ecommerce;
CREATE USER postgres WITH PASSWORD 'postgres';
GRANT ALL PRIVILEGES ON DATABASE solaris_ecommerce TO postgres;
```

### 3. Configurar Backend (solaris-ecommerce-api)

**No edites la contraseña directamente en `application.yml`** ni en archivos dentro de `target/` (Maven los regenera en cada `mvn spring-boot:run`).

Para desarrollo local, crea `src/main/resources/application-local.yml` a partir del ejemplo:

```bash
cd solaris-ecommerce-api/src/main/resources
copy application-local.yml.example application-local.yml
```

Luego edita `application-local.yml` con tu contraseña de PostgreSQL:

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/solaris_ecommerce
    username: postgres
    password: tu-password-de-postgres
```

Ejecutar el backend:
```bash
cd solaris-ecommerce-api
mvn spring-boot:run
```

El API estará disponible en: `http://localhost:8081/api`

Documentación Swagger: `http://localhost:8081/swagger-ui.html`

### 4. Configurar Frontend (solaris-ecommerce-web)

Instalar dependencias:
```bash
cd solaris-ecommerce-web
npm install
```

Ejecutar el frontend:
```bash
npm run dev
```

La aplicación estará disponible en: `http://localhost:3000`

## 🎯 Modos de Operación

### Modo Standalone (Autónomo)
El e-commerce funciona independientemente con su propia base de datos y lógica de negocio.

### Modo Integrado (Con Solaris)
El e-commerce se conecta a los servicios de Solaris:
- **solaris-api**: Para sincronización de productos, categorías y clientes
- **solaris-billing-api**: Para procesamiento de pagos (MercadoPago, Stripe)

Configuración en `application.yml`:
```yaml
solaris:
  api:
    url: http://localhost:8080/api
  billing:
    url: http://localhost:8082/api
```

## 📦 Estructura de Datos

### Entidades Principales (Compatibles con Solaris)

#### User
- firstname, lastname, email
- password (encriptado)
- role: ADMIN | CUSTOMER | STAFF
- authProvider: LOCAL | GOOGLE
- emailVerified, platformOperator

#### Category
- name, description
- createdAt, systemCategory
- Relaciones: user, createdBy

#### Product
- name, description, barcode
- barcodeFormat: EAN_13 | UPC_A | CODE_128 | CODE_39
- price, stockQuantity, lowStockThreshold
- ivaRate: EXENTO | REDUCIDO_10_5 | GENERAL_21
- Relaciones: user, category, createdBy

#### ProductImage (Nueva entidad específica)
- productId (FK)
- encryptedImageData (imágenes encriptadas)
- displayOrder, active
- Relaciones: product, createdBy

#### Customer
- documentType: CUIT | CUIL | DNI
- documentNumber, razonSocial
- email, phone, address
- condicionIva: RESPONSABLE_INSCRIPTO | MONOTRIBUTO | EXENTO | CONSUMIDOR_FINAL | NO_CATEGORIZADO
- Relaciones: user, documents, createdBy

#### CustomerDocument
- documentType, documentNumber
- primary (indica documento principal)
- Relaciones: customer

## 🔐 Autenticación

El sistema utiliza JWT (JSON Web Tokens) para la autenticación.

### Endpoints de Autenticación
- `POST /api/auth/register` - Registro de usuarios
- `POST /api/auth/authenticate` - Inicio de sesión

### Ejemplo de Login
```bash
curl -X POST http://localhost:8081/api/auth/authenticate \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

Respuesta:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "email": "user@example.com",
  "role": "CUSTOMER",
  "firstname": "John",
  "lastname": "Doe"
}
```

## 🎨 Personalización para Nuevos E-Commerce

Este proyecto está diseñado como template para crear múltiples tiendas online. Para personalizarlo:

### 1. Cambiar Identidad Visual
- Modificar colores en `tailwind.config.js`
- Personalizar componentes en `src/components/`
- Cambiar logo y favicon en `public/`

### 2. Configurar Temas
Crear archivo `src/config/theme.ts`:
```typescript
export const theme = {
  colors: {
    primary: '#your-brand-color',
    secondary: '#your-secondary-color',
    // ...
  },
  fonts: {
    // configuración de fuentes
  }
}
```

### 3. Personalizar Lógica de Negocio
- Modificar servicios en `src/service/`
- Agregar nuevos endpoints en controllers
- Personalizar validaciones según requerimientos

### 4. Integración con Pasarelas de Pagos
El proyecto está preparado para integrarse con solaris-billing-api que soporta:
- MercadoPago
- Stripe

## 📁 Estructura del Proyecto

```
solaris-e-commerce/
├── solaris-ecommerce-api/          # Backend Spring Boot
│   ├── src/main/java/com/luccavergara/solaris/ecommerce/
│   │   ├── controller/             # Controladores REST
│   │   ├── service/                # Lógica de negocio
│   │   ├── entity/                 # Entidades JPA
│   │   ├── repository/             # Repositorios JPA
│   │   ├── dto/                    # Data Transfer Objects
│   │   ├── security/               # Configuración JWT
│   │   └── config/                 # Configuración general
│   └── src/main/resources/
│       ├── application.yml         # Configuración
│       └── db/migration/           # Migraciones Flyway
├── solaris-ecommerce-web/          # Frontend React
│   ├── src/
│   │   ├── api/                    # Clientes HTTP
│   │   ├── components/             # Componentes reutilizables
│   │   ├── features/               # Funcionalidades por módulo
│   │   ├── types/                  # Tipos TypeScript
│   │   ├── hooks/                  # Custom hooks
│   │   ├── utils/                  # Utilidades
│   │   └── config/                 # Configuración
│   └── public/                     # Assets estáticos
└── README.md
```

## 🔧 Scripts Disponibles

### Backend
```bash
mvn clean install          # Compilar proyecto
mvn spring-boot:run        # Ejecutar aplicación
mvn test                   # Ejecutar tests
```

### Frontend
```bash
npm install                # Instalar dependencias
npm run dev                # Modo desarrollo
npm run build              # Build para producción
npm run preview            # Previsualizar build
npm run lint               # Linting
npm run test               # Ejecutar tests
```

## 🚧 Roadmap de Desarrollo

### ✅ Fase 1: Estructura Base (Completado)
- [x] Crear estructura del proyecto
- [x] Configurar backend Spring Boot
- [x] Configurar frontend React + TypeScript
- [x] Crear entidades compatibles con Solaris
- [x] Configurar base de datos y migraciones
- [x] Implementar autenticación JWT

### ✅ Fase 2: Funcionalidades Cliente (Completado)
- [x] Catálogo con búsqueda y filtros
- [x] Carrito de compras persistente
- [x] Checkout integrado con solaris-billing
- [x] Historial de pedidos
- [x] Perfil de usuario

### ✅ Fase 3: Funcionalidades Admin (Completado)
- [x] CRUD de productos con gestión de imágenes
- [x] Gestión de categorías
- [x] Gestión de clientes
- [x] Dashboard con reportes
- [x] Configuración de tienda

### 📋 Fase 4: Integración Solaris (Pendiente)
- [ ] Endpoints de sincronización con solaris-api
- [ ] Migración de datos entre sistemas
- [ ] Modo integrado vs standalone
- [ ] Webhooks para sincronización en tiempo real

### 📋 Fase 5: Sistema de Temas (Pendiente)
- [ ] Sistema de configuración visual
- [ ] Documentación para crear nuevos e-commerces
- [ ] Template de personalización

## 🤝 Contribución

Este proyecto es un template para crear e-commerces personalizados. Para contribuir:

1. Fork del proyecto
2. Crear rama para tu tienda: `git checkout -b tu-tienda-nombre`
3. Personalizar según necesidades
4. Commit cambios: `git commit -m 'Personalización para Tienda X'`
5. Push a tu rama: `git push origin tu-tienda-nombre`

## 📝 Licencia

Este proyecto es parte del ecosistema Solaris y está diseñado para ser utilizado como base para implementaciones de e-commerce personalizadas.

## 📞 Soporte

Para soporte técnico o preguntas sobre integración con Solaris, contactar al equipo de desarrollo.
