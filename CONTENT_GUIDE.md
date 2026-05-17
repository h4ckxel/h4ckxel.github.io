# Guía para mantener actualizado el sistema

## 1. Publicar un nuevo technical log

Los posts normales viven en `_posts/`.

1. Crea un archivo con este formato:

```text
YYYY-MM-DD-titulo-del-post.md
```

2. Usa una cabecera como esta:

```yaml
---
title: "Título del artículo"
excerpt: "Resumen corto para listados y SEO."
tags:
  - reversing
  - linux
---
```

3. Escribe el contenido en Markdown debajo del front matter.

Ejemplo:

```text
_posts/2026-05-16-analizando-un-binario-elf.md
```

La portada toma automáticamente los logs más recientes y permite reclamarlos como XP una sola vez dentro del Command Center.

## 2. Tipos de contenido recomendados

- `reversing`
- `linux`
- `ctf`
- `malware`
- `project-log`
- `engineering-note`
- `writeup`

La taxonomía no es decorativa: ayuda a que el sitio lea como diario técnico, academia y archivo operacional al mismo tiempo.

## 3. Agregar páginas fijas

Las páginas normales viven en `_pages/`.

Ejemplo:

```yaml
---
permalink: /recursos/
title: "Recursos"
excerpt: "Recursos"
---
```

Si quieres que aparezca en la navegación superior, agrega el enlace en `_data/navigation.yml`.

## 4. Agregar write-ups o series

Las colecciones actuales son:

- `_htb/` para Hack The Box
- `_otw/` para OverTheWire
- `_mbe/` para Modern Binary Exploitation
- `_dvwa/` para DVWA

Cada colección ya tiene reglas definidas en `_config.yml`, así que basta con crear nuevos archivos Markdown dentro de la carpeta correcta y, si aplica, enlazarlos desde `_data/navigation.yml`.

## 5. Configurar la progresión

El sistema de Command Center se controla desde:

- `data/missions.json`
- `data/ranks.json`
- `data/skills.json`
- `data/xp_config.json`

Ahí puedes ajustar XP, rangos, misiones, nodos del skill tree, achievements y progreso de proyectos sin tocar la lógica JavaScript.

La arquitectura completa está resumida en `PROGRESSION_ARCHITECTURE.md`.

## 6. Archivos que gobiernan el diseño

- Portada / Command Center: `index.html`
- Entrada CSS de la portada: `css/main.css`
- Módulos CSS de la portada: `css/dashboard/`
- Skin global del sitio: `_sass/minimal-mistakes/skins/_h4ckxel.scss`
- Ajustes visuales globales: `_sass/custom/_h4ckxel.scss`
- Lógica del dashboard: `assets/js/command-center/`
- Entrada principal de estilos del tema: `assets/css/main.scss`

## 7. Flujo recomendado

```bash
bundle install
bundle exec jekyll serve
```

Después abre `http://localhost:4000`, revisa:

1. la portada,
2. una página normal,
3. un post,
4. el registro de XP,
5. la misión activa,
6. la importación/exportación JSON.
