# Seguridad de LuxDropShop

## Hallazgos de la auditoría de código

- **Crítico — exposición de archivos:** el servidor podía devolver cualquier archivo dentro de la carpeta del proyecto. Ahora solo publica una lista cerrada de páginas y recursos; `.env`, SQLite, código y archivos internos responden 404.
- **Alto — Nodemailer desactualizado:** la instalación usaba 7.0.13, una rama fuera de soporte con advisories publicados. Se actualizó a Nodemailer 10.3.1; `npm audit --omit=dev` informa cero vulnerabilidades conocidas.
- **Alto — límites de autenticación ausentes:** registro y acceso podían recibir intentos ilimitados. Se añadieron límites por IP y correo para el login, por IP para registro y checkout, y `Retry-After` cuando se supera el límite.
- **Alto — origen de acciones con cookies:** operaciones mutables aceptaban solicitudes desde otros sitios. Ahora se rechazan orígenes incompatibles y `Sec-Fetch-Site: cross-site`.
- **Medio — identificadores de pedido débiles:** los nuevos IDs usan 96 bits aleatorios. Los antiguos mantienen su formato; el seguimiento público devuelve estado y rastreo, sin dirección ni correo, y tiene límite por IP.
- **Medio — inventario:** pedidos pendientes no reservaban unidades y líneas duplicadas podían superar la cantidad disponible. Ahora el servidor agrupa líneas, valida y descuenta stock dentro de una transacción; cancelar devuelve las unidades una sola vez.
- **Medio — XSS almacenado en seguimiento/cuenta:** campos de pedido se interpolaban en HTML. Ahora se escapan antes de mostrarse.

- **Medio — imágenes:** ahora se guardan en una carpeta privada de datos con nombres aleatorios; el backend verifica MIME, firma, dimensiones y límite de 2 MB antes de servirlas con `nosniff`.

## Configuración antes de publicar

1. Instala Node.js 24.22.2 o posterior. La versión encontrada durante la auditoría fue 24.22.1; actualízala antes de reiniciar el servidor.
2. Usa un `SESSION_SECRET` aleatorio de al menos 32 caracteres, una contraseña de administrador larga y exclusiva, y guarda `.env` con permisos restringidos. Nunca compartas su contenido.
3. Configura HTTPS, `NODE_ENV=production`, `PUBLIC_BASE_URL` con el origen HTTPS real, y termina TLS en un proxy mantenido. Con HTTPS en `PUBLIC_BASE_URL`, las cookies también reciben `Secure`.
4. No confíes en los límites en memoria para varias instancias: aplica rate limiting distribuido en el proxy/WAF y límites de conexiones/tamaño allí.
5. Haz copias cifradas de SQLite, prueba restaurarlas y limita acceso al host y a la carpeta de datos.
6. Revisa alertas de dependencias periódicamente (`npm audit`) y mantén Node.js en una versión LTS con parches.

## Alcance y límites

La auditoría fue estática y dinámica local sobre rutas de la aplicación; no se realizó una prueba desde internet, revisión del proveedor de hosting, escaneo de infraestructura ni pentest independiente. El código por sí solo no puede garantizar que el sitio sea impenetrable. Antes de aceptar pagos reales, añade MFA para el administrador, monitoreo y revisión externa; actualmente pagos y envíos siguen deshabilitados.
