# Etapas del desarrollo de software aplicadas a AguaYa

**Caso de estudio:** AguaYa – Plataforma tipo Rappi para la entrega de agua potable (PWA + SaaS)

---

## 1. Planificación

### Objetivos del proyecto

- Crear una plataforma web progresiva (PWA) que permita a clientes pedir agua a domicilio de forma sencilla.
- Ofrecer un modelo SaaS donde múltiples purificadoras puedan usar la misma plataforma, cada una con su cuenta y configuración.
- Proveer herramientas para tres roles principales: **cliente**, **repartidor** y **dueño de negocio**, además de un **administrador general**.

### Alcance

| Incluido | No incluido (fuera del alcance inicial) |
|----------|----------------------------------------|
| Registro e inicio de sesión con roles | App nativa (iOS/Android) |
| Carrito de compras y pedidos | Pasarela de pagos integrada (fase 1) |
| Estados de pedido en tiempo real | Algoritmo avanzado de optimización de rutas |
| Dashboard para dueños con ventas, reseñas y promociones | Integración con sistemas contables externos |
| Sistema de suscripciones (modelo SaaS) | Chat en vivo cliente-repartidor |
| Mapa para repartidores | |

### Recursos identificados

- **Equipo:** Desarrolladores frontend (React), backend (Node.js), diseñador UI/UX.
- **Tecnologías:** React + Vite, Firebase (autenticación), PostgreSQL (base de datos relacional).
- **Infraestructura:** Servidor con HTTPS para cumplir requisitos PWA.

### Plazos y presupuesto (ejemplo)

| Fase | Duración estimada |
|------|-------------------|
| Planificación y análisis | 2 semanas |
| Diseño | 2 semanas |
| Programación | 6 semanas |
| Pruebas | 2 semanas |
| Implementación | 1 semana |
| **Total** | **13 semanas** |

### Evaluación de viabilidad

- **Técnica:** Viable; las tecnologías elegidas (React, Firebase, PostgreSQL) son maduras y bien documentadas.
- **Financiera:** Bajo costo inicial; Firebase tiene capa gratuita; PostgreSQL es open source.
- **Riesgos identificados:**
  - Dependencia de conexión a internet del repartidor.
  - Adopción tecnológica por parte de purificadoras tradicionales.

---

## 2. Análisis

### Requisitos funcionales

| Rol | Requisitos |
|-----|-----------|
| **Cliente** | Registrarse/iniciar sesión, ver catálogo de productos, agregar al carrito, confirmar pedido, ver estado del pedido, dejar reseñas y sugerencias. |
| **Repartidor** | Iniciar sesión, ver lista de pedidos asignados, ver mapa con direcciones, actualizar estado del pedido (aceptado, en camino, entregado). |
| **Dueño** | Acceder a dashboard con pedidos y estadísticas, gestionar productos (alta, baja, precios, imágenes), administrar repartidores y empleados, ver reseñas, crear promociones, ver suscripción. |
| **Administrador** | Supervisar todas las tiendas, verificar documentación de negocios, controlar suscripciones y sugerencias globales. |

### Requisitos no funcionales

| Categoría | Descripción |
|-----------|-------------|
| **Rendimiento** | La app debe cargar en menos de 3 segundos en conexión 4G. |
| **Seguridad** | Conexión HTTPS obligatoria; autenticación segura con Firebase. |
| **Usabilidad** | Interfaz intuitiva, similar a apps conocidas (Rappi, Uber Eats); botones grandes para uso táctil. |
| **Disponibilidad** | Sistema disponible 24/7 con mínimo tiempo de inactividad. |
| **Escalabilidad** | Arquitectura preparada para múltiples purificadoras (multi-tenant). |

### Modelos y diagramas (ejemplos)

- **Diagrama de casos de uso:** Cliente realiza pedido, Repartidor actualiza estado, Dueño consulta dashboard.
- **Diagrama entidad-relación (ER):** Tablas principales:
  - `users` (id, nombre, email, rol, firebase_uid)
  - `locales` (id, nombre, dirección, dueño_id, suscripción_id)
  - `products` (id, nombre, precio, imagen, local_id)
  - `orders` (id, cliente_id, local_id, repartidor_id, estado, created_at, delivered_at)
  - `order_items` (id, order_id, product_id, cantidad)
  - `reviews` (id, order_id, calificación, comentario)
  - `promotions` (id, local_id, descripción, descuento, vigencia)
  - `subscriptions` (id, local_id, plan, estado, fecha_inicio, fecha_fin)

---

## 3. Diseño

### Diseño de alto nivel (arquitectura del sistema)

```
┌─────────────────────────────────────────────────────────────┐
│                      CLIENTE (PWA)                          │
│   React + Vite │ Service Worker │ manifest.json             │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      BACKEND (API REST)                     │
│                         Node.js                             │
└─────────────────────────────────────────────────────────────┘
              │                             │
              ▼                             ▼
┌─────────────────────────┐     ┌─────────────────────────────┐
│       Firebase          │     │        PostgreSQL           │
│   (Autenticación)       │     │  (Datos del negocio:        │
│   - Login con Google    │     │   pedidos, productos,       │
│   - Login email/password│     │   usuarios, tiendas, etc.)  │
└─────────────────────────┘     └─────────────────────────────┘
```

### Diseño detallado

**Estructura de carpetas (frontend):**

```
src/
├── components/          # Componentes reutilizables (botones, tarjetas, etc.)
├── pages/               # Vistas por rol (Cliente, Repartidor, Dueño, Admin)
├── services/            # Llamadas a la API y Firebase
├── hooks/               # Custom hooks (useAuth, useOrders, etc.)
├── context/             # Context API (AuthContext, CartContext)
├── assets/              # Imágenes, iconos
├── styles/              # CSS o archivos de estilos
├── App.jsx
└── main.jsx
```

**Patrones de diseño aplicados:**

- **MVC (Modelo-Vista-Controlador):** Separación entre lógica de negocio (backend), datos (PostgreSQL) y presentación (React).
- **Context API:** Para manejar estado global (usuario autenticado, carrito de compras).
- **Atomic Design:** Componentes pequeños y reutilizables que se combinan en vistas más complejas.

**Diseño de interfaz (UI/UX):**

| Principio | Aplicación en AguaYa |
|-----------|----------------------|
| Diseño centrado en el usuario | Flujos simples: pedir agua en pocos pasos. |
| Inspiración en apps conocidas | Tarjetas de productos, barra de navegación, carrito. |
| Consistencia visual | Paleta de colores azules y blancos (agua); botones uniformes. |
| Accesibilidad | Botones grandes, contraste adecuado, formularios claros. |
| Responsive | Adaptable a móvil (principal) y escritorio. |

---

## 4. Programación

### Tecnologías utilizadas

| Capa | Tecnología |
|------|------------|
| Frontend | JavaScript (99.2%), React, Vite |
| Backend | Node.js (Express) |
| Base de datos | PostgreSQL |
| Autenticación | Firebase Authentication |
| PWA | manifest.json, Service Worker |
| Control de versiones | Git + GitHub (`NotToxict/AguaYa`) |

### Ejemplo de código (fragmentos representativos)

**Componente de tarjeta de producto (React):**

```javascript
function ProductCard({ product, onAddToCart }) {
  return (
    <div className="product-card">
      <img src={product.image} alt={product.name} />
      <h3>{product.name}</h3>
      <p>${product.price}</p>
      <button onClick={() => onAddToCart(product)}>
        Agregar al carrito
      </button>
    </div>
  );
}
```

**Endpoint para obtener pedidos (Node.js + Express):**

```javascript
app.get('/api/orders/:localId', async (req, res) => {
  const { localId } = req.params;
  const orders = await db.query(
    'SELECT * FROM orders WHERE local_id = $1 ORDER BY created_at DESC',
    [localId]
  );
  res.json(orders.rows);
});
```

### Buenas prácticas aplicadas

- Código legible y bien comentado.
- Nombres descriptivos para variables y funciones.
- Separación de responsabilidades (componentes, servicios, hooks).
- Uso de linters (ESLint) para mantener calidad del código.

---

## 5. Pruebas

### Tipos de pruebas a realizar

| Tipo de prueba | Descripción | Ejemplo en AguaYa |
|----------------|-------------|-------------------|
| **Unitarias** | Verifican funciones o componentes individuales. | Probar que `calculateTotal(cart)` devuelve el precio correcto. |
| **Integración** | Verifican que varios módulos funcionen juntos. | Probar que al agregar un producto al carrito, el estado global se actualice y el backend lo registre. |
| **Sistema** | Verifican el sistema completo. | Probar el flujo: cliente inicia sesión → agrega productos → confirma pedido → repartidor lo ve en su lista. |
| **Aceptación** | Validan que el software cumpla con los requisitos del usuario. | Dueño de purificadora prueba el dashboard y confirma que ve ventas y reseñas correctamente. |

### Casos de prueba (ejemplos)

| ID | Caso de prueba | Resultado esperado |
|----|----------------|-------------------|
| CP-01 | Cliente agrega 2 garrafones al carrito. | El carrito muestra 2 productos y el total correcto. |
| CP-02 | Cliente confirma pedido sin dirección. | El sistema muestra error: "La dirección es obligatoria". |
| CP-03 | Repartidor marca pedido como "Entregado". | El estado del pedido cambia a "Entregado" y el cliente puede verlo. |
| CP-04 | Dueño accede al dashboard. | Ve resumen de pedidos, ventas del día y lista de reseñas. |
| CP-05 | Usuario intenta acceder sin iniciar sesión. | Es redirigido a la pantalla de login. |

### Herramientas de pruebas

- **Jest:** Para pruebas unitarias de funciones JavaScript.
- **React Testing Library:** Para pruebas de componentes React.
- **Postman:** Para probar endpoints de la API.
- **Pruebas manuales:** Navegación real en dispositivos móviles y de escritorio.

---

## 6. Implementación

### Estrategia de despliegue

Se utilizará un **despliegue gradual por fases:**

| Fase | Descripción |
|------|-------------|
| **Fase 1 - Piloto** | Desplegar con 1-2 purificadoras de prueba para validar funcionamiento real. |
| **Fase 2 - Expansión** | Incorporar más purificadoras gradualmente, corrigiendo errores detectados. |
| **Fase 3 - Producción completa** | Abrir la plataforma a cualquier purificadora interesada. |

### Actividades de implementación

1. **Configuración de infraestructura:**
   - Servidor con HTTPS (obligatorio para PWA y seguridad).
   - Base de datos PostgreSQL en producción.
   - Proyecto Firebase configurado para producción.

2. **Despliegue del frontend (PWA):**
   - Build de producción con Vite (`npm run build`).
   - Subir archivos estáticos al servidor o servicio de hosting (ej. Vercel, Netlify).
   - Verificar que `manifest.json` y Service Worker funcionen correctamente.

3. **Despliegue del backend:**
   - Subir código del servidor Node.js.
   - Configurar variables de entorno (credenciales de Firebase, conexión a PostgreSQL).
   - Probar endpoints en producción.

4. **Migración de datos:**
   - Crear tablas en PostgreSQL de producción.
   - Cargar datos iniciales (productos, planes de suscripción, etc.).

5. **Monitoreo inicial:**
   - Supervisar rendimiento y errores durante los primeros días.
   - Atender incidencias reportadas por usuarios piloto.

---

## 7. Mantenimiento

### Tipos de mantenimiento

| Tipo | Descripción | Ejemplo en AguaYa |
|------|-------------|-------------------|
| **Correctivo** | Corregir errores detectados después del lanzamiento. | Un cliente reporta que el carrito no guarda productos; se corrige el bug. |
| **Adaptativo** | Adaptar el sistema a cambios en el entorno. | Actualizar dependencias de React o Firebase cuando hay nuevas versiones. |
| **Perfectivo** | Mejorar funcionalidades existentes. | Agregar gráficas más detalladas en el dashboard del dueño. |
| **Preventivo** | Anticipar problemas futuros. | Optimizar consultas a la base de datos para evitar lentitud cuando crezcan los pedidos. |

### Actividades de mantenimiento programadas

- **Semanal:** Revisar logs de errores y rendimiento.
- **Mensual:** Actualizar dependencias y librerías.
- **Trimestral:** Evaluar nuevas funcionalidades solicitadas por usuarios; planificar mejoras.
- **Continuo:** Parches de seguridad cuando se detecten vulnerabilidades.

### Futuras mejoras planificadas

- Notificaciones push para avisar al cliente sobre el estado de su pedido.
- Algoritmo de optimización de rutas para repartidores.
- Integración con pasarelas de pago (tarjeta, transferencia).
- App nativa con React Native (si la demanda lo justifica).

---

## 8. Documentación

### Tipos de documentación generados

| Tipo | Contenido | Audiencia |
|------|-----------|-----------|
| **Manual de usuario - Cliente** | Cómo registrarse, hacer pedidos, ver estado, dejar reseñas. | Clientes finales. |
| **Manual de usuario - Repartidor** | Cómo ver pedidos, usar el mapa, actualizar estados. | Repartidores. |
| **Manual de usuario - Dueño** | Cómo usar el dashboard, gestionar productos, ver reseñas, crear promociones. | Dueños de purificadoras. |
| **Documentación técnica** | Arquitectura del sistema, estructura de la base de datos, endpoints de la API, estructura de carpetas del código. | Desarrolladores. |
| **README del repositorio** | Instrucciones para instalar, configurar y ejecutar el proyecto localmente. | Desarrolladores y colaboradores. |
| **Guía de instalación PWA** | Cómo "instalar" AguaYa en la pantalla de inicio del celular. | Todos los usuarios. |

### Importancia de la documentación

- Facilita el **mantenimiento** a largo plazo.
- Permite que nuevos desarrolladores se integren rápidamente al proyecto.
- Reduce el tiempo de capacitación para usuarios (clientes, repartidores, dueños).
- Asegura la **continuidad** del proyecto aunque cambie el equipo de desarrollo.

---

## Conclusión

AguaYa atraviesa todas las etapas del ciclo de desarrollo de software:

1. **Planificación:** Se definieron objetivos, alcance, recursos y plazos.
2. **Análisis:** Se identificaron requisitos funcionales y no funcionales para cada rol.
3. **Diseño:** Se creó la arquitectura del sistema y el diseño de interfaz.
4. **Programación:** Se desarrolló con JavaScript, React, Node.js, Firebase y PostgreSQL.
5. **Pruebas:** Se planificaron pruebas unitarias, de integración, sistema y aceptación.
6. **Implementación:** Se definió una estrategia de despliegue gradual.
7. **Mantenimiento:** Se contemplaron mejoras continuas y corrección de errores.
8. **Documentación:** Se generaron manuales de usuario y documentación técnica.

Seguir estas etapas garantiza que AguaYa sea un software **eficiente, seguro, escalable y útil** tanto para purificadoras como para sus clientes.