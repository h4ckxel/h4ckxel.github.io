---
permalink: /notes/
title: "Notes"
excerpt: "Short technical notes, research logs, and study fragments."
---

This page is a small index for notes that do not need to become full writeups yet.

Use `_posts/` for published logs and tag short entries with `note`, `linux`, `reversing`, `math`, or `systems`.

## Recent notes and logs

{% for post in site.posts limit:10 %}
- {{ post.date | date: "%Y-%m-%d" }} — [{{ post.title }}]({{ post.url | relative_url }})
{% endfor %}
