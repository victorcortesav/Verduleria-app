# Verdulería S&F — App para tablet (Android)

App instalable en la tablet, sin necesidad de internet ni de un servidor
aparte. Todos los datos (catálogo y ventas) se guardan directamente en el
dispositivo. Los reportes se generan localmente (Excel y CSV).

## Novedades de esta versión (v3)

- **Venta más rápida:** "Finalizar venta" ahora cierra el proceso solo
  (muestra el monto ~2 segundos y desaparece) — ya no hay que tocar
  "Nueva venta".
- **Nuevo nombre:** "Verdulería S&F", con ícono doble en el encabezado.
- **Ícono de ensalada preparada** agregado al banco de íconos.
- **Banco de íconos ampliado a 220** — ahora cubre prácticamente todas las
  categorías de un supermercado (carnes, lácteos, panadería, bebidas,
  limpieza, higiene personal, congelados, conservas, mascotas, bebé, etc.),
  no solo frutas y verduras.
- **Orden automático por más vendidos:** los productos en la grilla
  principal se reordenan solos después de cada venta, mostrando primero los
  que más se han vendido (por cantidad acumulada). Un producto nuevo sin
  ventas queda al final hasta que empiece a venderse.
- **Validación de nombres duplicados:** si intentas agregar un producto con
  un nombre que ya existe en el catálogo (sin importar mayúsculas o tildes),
  la app avisa y no deja guardar hasta que cambies el nombre.

## Cómo obtener el archivo .apk (vía GitHub, sin instalar nada pesado)

### Paso 1 — Crear una cuenta gratuita en GitHub
Si no tienes una, entra a **github.com** y crea una cuenta (solo necesitas
un correo). Es gratis.

### Paso 2 — Crear un repositorio nuevo
1. Una vez dentro de GitHub, click en el botón **"+"** (arriba a la derecha) → **"New repository"**.
2. Ponle un nombre, por ejemplo `verduleria-app`.
3. Déjalo como **privado** (nadie más lo verá).
4. Click en **"Create repository"**. No marques ninguna opción adicional (README, .gitignore, etc.) — el proyecto ya los trae.

### Paso 3 — Subir este proyecto a tu repositorio
Necesitas tener **Git** instalado en tu computador (si no lo tienes, se
instala gratis desde git-scm.com). Luego, en una terminal, dentro de esta
misma carpeta del proyecto (`verduleria-tablet`), ejecuta:

```
git init
git add .
git commit -m "Primera versión de la app"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/verduleria-app.git
git push -u origin main
```

Reemplaza `TU-USUARIO` por tu nombre de usuario de GitHub, y `verduleria-app`
por el nombre que le hayas puesto al repositorio. GitHub te pedirá iniciar
sesión la primera vez (puede pedirte crear un "token" en vez de contraseña —
GitHub te guía en el momento si es necesario).

### Paso 4 — Esperar a que se compile automáticamente
Apenas subas el proyecto, GitHub empieza a compilar el `.apk`
automáticamente (dejamos configurado un robot que lo hace solo). Para verlo:

1. Entra a tu repositorio en github.com
2. Click en la pestaña **"Actions"** (arriba)
3. Vas a ver un proceso corriendo — tarda entre 3 y 6 minutos
4. Cuando termine (ícono verde ✓), haz click en ese proceso

### Paso 5 — Descargar el .apk
Dentro de esa página, baja hasta la sección **"Artifacts"** y haz click en
**"verduleria-apk"** — se descarga un archivo `.zip` que contiene el
`app-debug.apk`. Ese es el archivo que se instala en la tablet.

## Cómo instalar el .apk en la tablet

1. Copia el archivo `app-debug.apk` a la tablet (por USB, Google Drive, WhatsApp Web, un correo a ti mismo — cualquier método sirve).
2. En la tablet, abre el archivo desde el explorador de archivos o desde la
   descarga.
3. Android va a pedir permiso para "instalar apps de fuentes desconocidas" —
   es normal y seguro, ya que no viene de Google Play. Actívalo cuando te lo
   pida.
4. Confirma la instalación. Va a quedar un ícono de "Verdulería" en la
   pantalla de inicio, como cualquier otra app.

## Enviar reportes por correo

Dentro del panel de Reportes, hay una sección "Correos predeterminados":

- **Agregar un correo:** escríbelo en el campo y presiona "+ Agregar". Queda
  guardado en el dispositivo para usarlo las veces que quieras.
- **Usar un correo guardado:** tócalo — se copia automáticamente al
  portapapeles.
- **Enviar el reporte:** presiona "📧 Enviar por correo (adjunta el Excel)".
  Se abre el selector de apps del dispositivo (Gmail, Outlook, etc.) con el
  Excel ya adjunto — solo falta pegar el correo que copiaste en el campo
  "Para" y enviar.

Este método no tiene costo ni depende de ningún servicio externo — usa la
misma app de correo que ya tengas configurada en la tablet. El único paso
manual es pegar la dirección, ya que por restricciones de seguridad de
Android no es posible pre-rellenar el destinatario y adjuntar un archivo al
mismo tiempo en un solo paso.

Si el dispositivo no soporta compartir archivos directamente (algunos
navegadores/WebView antiguos), el botón descarga el Excel igual y avisa que
hay que adjuntarlo manualmente desde la app de correo.

**Corrección importante (versión 2):** la primera versión usaba una función
web (`navigator.share`) para compartir el archivo, que no funcionaba de
forma confiable dentro del contenedor de la app. Se reemplazó por los
plugins oficiales de Capacitor (`Filesystem` y `Share`), que usan las
herramientas nativas reales de Android — mucho más confiables. Aun así,
**no pude probarlo en una tablet física desde aquí**, así que apenas
actualices la app, verifica que:
- "Descargar Excel/CSV" muestre un mensaje confirmando dónde se guardó
- "Enviar por correo" abra el selector de apps con el archivo adjunto

Si alguno de los dos falla, avísame para ajustarlo.

## Qué esperar de esta primera versión (siendo honesto)

- **Los datos y el catálogo se guardan en el dispositivo** (no se pierden al
  cerrar la app), pero no se respaldan automáticamente en ningún lado más.
  Si la tablet se rompe o se resetea, se pierde el historial — conviene, más
  adelante, agregar un respaldo (por ejemplo, exportar y guardar los Excel
  semanalmente en Google Drive).
- **La descarga de reportes (Excel/CSV)** ahora usa el plugin nativo
  `Filesystem` de Capacitor, guardando el archivo directamente en el
  almacenamiento del dispositivo (carpeta Documents de la app). Es más
  confiable que el método anterior, pero de todas formas no pude probarlo en
  una tablet física real desde aquí — es el primer punto a verificar apenas
  actualices la app.
- Este primer build es una versión **debug** (para pruebas). Funciona
  perfectamente para uso normal, pero si más adelante quieres distribuirla
  de forma más "oficial" (firmarla, subirla a una tienda privada, etc.), eso
  es un paso aparte que se puede agregar después.

## Próximos pasos posibles

- Agregar un botón de "Respaldar datos" que suba automáticamente una copia
  a Google Drive o similar.
- Ícono y nombre personalizados de la app (hoy usa el ícono genérico de
  Capacitor).
- Ajustar el guardado de archivos si la descarga automática no funciona bien
  en la tablet real.
