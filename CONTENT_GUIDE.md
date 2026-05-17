# Guía para mantener actualizado el blog

## 1. Publicar un artículo nuevo

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

3. Escribe el contenido debajo en Markdown.

Ejemplo:

```text
_posts/2026-05-16-analizando-un-binario-elf.md
```

La portada toma automáticamente los 3 posts más recientes desde `site.posts`.

## 2. Agregar páginas fijas

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

## 3. Agregar write-ups o series

Las colecciones actuales son:

- `_htb/` para Hack The Box
- `_otw/` para OverTheWire
- `_mbe/` para Modern Binary Exploitation
- `_dvwa/` para DVWA

Cada colección ya tiene reglas definidas en `_config.yml`, así que basta con crear nuevos archivos Markdown dentro de la carpeta correcta y, si aplica, enlazarlos desde `_data/navigation.yml`.

## 4. Archivos que gobiernan el diseño

- Portada: `index.html`
- Estilos de la portada: `css/main.css`
- Skin global del sitio: `_sass/minimal-mistakes/skins/_h4ckxel.scss`
- Ajustes visuales globales: `_sass/custom/_h4ckxel.scss`
- Entrada principal de estilos del tema: `assets/css/main.scss`

## 5. Flujo recomendado

```bash
bundle install
bundle exec jekyll serve
```

Después abre `http://localhost:4000`, revisa la portada, una página normal y al menos un post antes de publicar.