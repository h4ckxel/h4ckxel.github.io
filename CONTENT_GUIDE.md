# Guía para mantener actualizado el sitio

Este repositorio funciona como archivo técnico personal: logs, notes, tools, systems, research y writeups.

## 1. Publicar un log nuevo

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
  - linux
  - reversing
---
```

3. Escribe el contenido en Markdown debajo del front matter.

Ejemplo:

```text
_posts/2026-05-18-analizando-un-binario-elf.md
```

La portada toma automáticamente los últimos posts desde `site.posts`.

## 2. Tipos de contenido recomendados

- `writeup`
- `note`
- `linux`
- `reversing`
- `systems`
- `math`
- `tooling`
- `ctf`

Mantén los títulos directos y técnicos. El sitio debe leerse como un archivo de laboratorio, no como una landing page.

## 3. Agregar páginas fijas

Las páginas normales viven en `_pages/`.

Ejemplo:

```yaml
---
permalink: /notes/
title: "Notes"
excerpt: "Short technical notes."
---
```

Si quieres que aparezca en la navegación superior, agrega el enlace en `_data/navigation.yml`.

## 4. Agregar writeups o series

Las colecciones actuales son:

- `_htb/` para Hack The Box
- `_otw/` para OverTheWire
- `_mbe/` para Modern Binary Exploitation
- `_dvwa/` para DVWA, si se agregan archivos en esa colección

Cada colección ya tiene reglas definidas en `_config.yml`, así que basta con crear nuevos archivos Markdown dentro de la carpeta correcta y enlazarlos desde `_data/navigation.yml` si aplica.

## 5. Archivos principales de diseño

- Home minimal: `index.html`
- CSS de la home: `css/main.css`
- Skin global del tema: `_sass/minimal-mistakes/skins/_h4ckxel.scss`
- Ajustes visuales globales: `_sass/custom/_h4ckxel.scss`
- Entrada principal de estilos del tema: `assets/css/main.scss`

La home no carga JavaScript del sistema de dashboard anterior.

## 6. Flujo recomendado

```bash
bundle install
bundle exec jekyll serve
```

Después abre `http://localhost:4000` y revisa:

1. la home,
2. `/writeups/`,
3. `/projects/`,
4. `/notes/`,
5. un post,
6. una colección como HTB, MBE u OTW.
