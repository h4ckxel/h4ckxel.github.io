# H4CKXEL

Blog técnico sobre seguridad ofensiva, reverse engineering, exploit development y sistemas.

El sitio sigue construido sobre Jekyll y conserva la estructura real del blog — posts, proyectos,
trainings y colecciones de write-ups — pero ahora con una presentación más sobria, editorial y
centrada en lectura.

## Dirección visual

- Editorial en vez de teatral
- Paleta oscura neutra con acentos contenidos
- Jerarquía de lectura antes que decoración
- Sin terminal falso, scanlines, cursor custom, canvas de partículas ni animaciones decorativas en la portada

## Ejecutar localmente

```bash
bundle install
bundle exec jekyll serve
```

Luego abre `http://localhost:4000`.

## Secciones principales

- `/` — portada
- `/projects/` — proyectos
- `/writeups/` — archivo de write-ups
- `/trainings/` — material de estudio
- `/about/` — página sobre el blog

## Mantener actualizado el blog

- Nuevos posts del blog: `_posts/`
- Nuevas páginas normales: `_pages/`
- Write-ups por colección: `_htb/`, `_otw/`, `_mbe/`, `_dvwa/`
- Navegación superior y menús laterales: `_data/navigation.yml`

Para ejemplos listos para copiar y pegar, revisa [`CONTENT_GUIDE.md`](CONTENT_GUIDE.md).
