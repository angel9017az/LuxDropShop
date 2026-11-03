# LuxDropShop

Tienda web con interfaz HTML/CSS/JS, API Node.js sin dependencias externas y base SQLite. Mantiene la identidad negro, blanco y dorado existente.

## Inicio local

Requiere Node.js 24.22.2 o posterior (usa `node:sqlite`). Actualiza Node.js antes de exponer la tienda; esta versión incluye correcciones de seguridad recientes.

1. Copia `.env.example` a `.env`.
2. Configura `SESSION_SECRET` con al menos 32 caracteres aleatorios y define `ADMIN_EMAIL` y `ADMIN_PASSWORD` únicos.
3. En PowerShell usa `npm.cmd start` (evita la política de scripts que bloquea `npm.ps1`) o ejecuta `Start-LuxDropShop.bat` desde el Explorador. Luego visita `http://127.0.0.1:3000`.
4. Panel administrativo: `/admin.html`. Cliente: `/account.html`. Seguimiento: `/tracking.html`.
5. Pruebas: `npm.cmd test`.

Si aparece que el puerto 3000 está ocupado, comprueba primero `http://127.0.0.1:3000`; puede haber una instancia de LuxDropShop ya iniciada. Para ejecutar otra instancia en PowerShell: `$env:PORT=3001; npm.cmd start` y abre `http://127.0.0.1:3001`.

La base SQLite se crea en `data/luxdropshop.sqlite`. El catálogo inicial contiene productos de muestra con inventario cero; actualiza y valida productos desde administración antes de aceptar pedidos.

## Implementado

- Backend HTTP y base SQLite con tablas para productos, órdenes, eventos, pagos, clientes, reseñas, documentos legales, envíos, sesiones y auditoría.
- Catálogo servido desde la API; filtros y búsqueda en frontend.
- Fichas de producto con rutas legibles `/productos/<producto>`, metadatos propios para compartir y respuesta 404 cuando el producto no existe.
- Carrito en `localStorage` solamente como borrador temporal. No almacena pedidos, cuentas, pagos ni inventario.
- Checkout manda los datos al servidor. El servidor recalcula precios, valida los campos/consentimiento, genera identificador, registra el pedido y deja pago pendiente.
- Stock validado y descontado al registrar pedidos dentro de una transacción; líneas duplicadas se agregan y cancelar el pedido devuelve las unidades una sola vez. El catálogo semilla comienza en cero para impedir pedidos sin inventario configurado.
- Contraseñas de cliente con `scrypt`; sesiones aleatorias con hash guardado en SQLite y cookie `HttpOnly`, `SameSite=Strict`.
- Checkout y endpoint de pago requieren sesión de cliente; el perfil permite nombre, apellidos y teléfono opcional. Checkout carga automáticamente nombre y correo y guarda versión/fecha de aceptación de términos y del aviso de privacidad.
- Banner de preferencias de cookies con aceptar todas, solo necesarias o configuración; se puede reabrir desde el control persistente. Actualmente no hay analítica ni publicidad opcional activa.
- Panel de administración con login, productos/precios/inventario y consulta/actualización de estados de pedido y rastreo. Las imágenes de producto admiten PNG/JPG local (máximo 2 MB) o URL HTTPS; se puede marcar una oferta para destacarla en el inicio, con validación de precio anterior mayor al actual; las cargas se validan y guardan bajo la carpeta de datos del servidor. La sesión admin usa contraseña configurada por entorno y no tiene endpoint de registro.
- Historial de pedidos con búsqueda, vista de activos/archivados y archivado individual o masivo reversible desde administración; conserva el registro y genera auditoría en lugar de borrarlo físicamente.
- Seguimiento limitado a identificador, estado y rastreo; no expone dirección ni datos personales del pedido.
- Plantillas legales para privacidad, compra, envíos, cancelaciones, garantías y cookies, editables desde Administración → Legal. Los campos comerciales se marcan `[COMPLETAR]`; la pantalla advierte que no acredita cumplimiento hasta completar y revisar la operación real.
- Cabeceras de seguridad (CSP, anti-framing, Permissions-Policy, HSTS en producción), validación de origen/Fetch Metadata para escrituras con cookie, límites de acceso por IP/cuenta y limpieza periódica de sesiones vencidas.
- El servidor publica una lista cerrada de HTML/CSS/JS; `.env`, la base de datos, dependencias, código fuente y archivos internos devuelven 404. La API de salud no revela configuración.
- Pruebas automatizadas de API, inventario, validación, cuentas y sesión administrativa.

## Funcionalidad aún pendiente

- **Pagos SPEI:** instrucciones configurables y recepción/verificación manual de comprobantes aún no están implementadas. No hay cargas de archivos ni confirmación automática. No se permite marcar pagado desde el panel hasta conectar el flujo manual de verificación del ingreso real.
- **PayPal/tarjetas:** endpoints informan deshabilitado; requiere elegir proveedor, credenciales, flujo alojado/tokenizado, webhooks firmados e idempotencia. El sistema no captura datos de tarjeta.
- **Envíos:** no hay tarifas ni tiempos inventados. Falta definir servicios, zonas, reglas por código postal y proveedor; hoy total del pedido no incluye envío.
- **Correo:** al crear un pedido se agrega una notificación durable de nuevo pedido al administrador. Los pedidos recibidos dentro de una ventana de 60 segundos se agrupan como “Tienes N nuevos pedidos”; el HTML incluye resumen y enlace al panel. La cola reintenta entregas y se puede inspeccionar/reintentar desde administración. Sin SMTP configurado, el aviso se retiene como bloqueado y no se afirma que se haya enviado.
- **Reseñas verificadas/moderación:** el esquema existe, pero las rutas y UI de reseñas deben ligarse a compras pagadas y moderación.
- **Cuentas cliente:** registro, login e historial autenticado están incluidos. Aún faltan recuperación/verificación de correo, MFA para administradores, edición de direcciones y asociación de pedidos de invitado a cuenta.
- **Administración:** gestión básica de producto y pedido funciona; faltan carga segura de imágenes, clientes, pagos, documentos desde interfaz visual, configuración de envíos, roles múltiples, búsqueda/paginación, acciones de inventario auditadas y herramientas de respaldo.
- **Legales México:** los documentos son placeholders pendientes. Deben redactarse con identidad y prácticas reales del negocio, considerar legislación vigente y recibir revisión legal profesional. Esta entrega no certifica cumplimiento.
- **Producción:** los límites anti-abuso actuales se guardan en memoria y sirven para una sola instancia; coloca un proxy/WAF con límites distribuidos al escalar o publicar en internet. SQLite es para una instancia de bajo volumen. Antes de operar, configura HTTPS y `NODE_ENV=production`, verifica permisos del sistema operativo, crea backups cifrados y probados, monitoriza alertas, y añade recuperación de cuenta, MFA del administrador y revisión independiente. La tienda no se considera invulnerable. Consulta `SECURITY.md` para el resumen de hallazgos y pasos operativos.

## Variables/credenciales necesarias

- Base: `DATABASE_PATH` (opcional), `SESSION_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`.
- Comercio: `STORE_LEGAL_NAME`, `STORE_EMAIL`, `STORE_PHONE`, `STORE_ADDRESS` y datos de privacidad/contacto reales.
- SPEI: banco, titular, CLABE e instrucciones; no incluirlos en público hasta validarlos.
- PayPal: `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET` y configuración de webhooks.
- Tarjeta: proveedor elegido, credenciales privadas/publicables y endpoint secreto de webhook.
- Correo: `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM`, `ADMIN_EMAIL` y `PUBLIC_BASE_URL` (URL pública del panel en despliegue). Se requiere instalar dependencias con `npm.cmd install` después del cambio para incorporar Nodemailer; reinicia el servidor tras completar `.env`.
- Envíos: proveedor, API key, cobertura, tarifas y compromisos de entrega.

No guardes secretos en Git. `.env` está excluido de entrega; limita su acceso en el servidor. Usa HTTPS y `NODE_ENV=production` para cookies Secure. En este entorno se detectó Node.js 24.22.1; el servidor requiere 24.22.2 o posterior. Actualiza Node y reinicia la aplicación.
