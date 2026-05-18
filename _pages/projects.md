---
permalink: /projects/
title: "Projects"
excerpt: "Small tools, systems experiments, and security projects."
---

---
This is a curated selection of projects that represent the current direction of the lab: offensive security, security tooling, and software engineering fundamentals.

## Security

### CVE-2025-2005

Proof-of-concept research around a critical WordPress plugin vulnerability. The project documents the issue, the exploitation flow, and the defensive ideas needed to understand the bug responsibly.

**Link:** [CVE-2025-2005](https://github.com/h4ckxel/CVE-2025-2005)

### Escaner de Puertos

A Python networking project focused on port scanning and concurrent execution. It is one of the projects I am evolving into a more disciplined security tool with better validation, reporting, and testing.

**Link:** [escaner-de-puertos](https://github.com/h4ckxel/escaner-de-puertos)

## Software engineering

### Decuber

Decuber is a Rubik's Cube-inspired message encoder built with HTML, CSS, JS, and Python.  
It converts characters into color pairs using a 6-color scheme, storing 4 characters per cube face.  
The included Python script [`DecuberBase36.py`](https://github.com/h4ckxel/Decuber/blob/main/DecuberBase36.py) extends functionality to encode any binary data (text, images, ZIPs) into base36 and then into cube colors.  
This version supports CLI encoding/decoding, optional OpenSSL encryption, and works on Linux, macOS, and WSL.  
It requires Python 3.x and has no external dependencies.

**Link:** [Decuber](https://github.com/h4ckxel/Decuber)

### CardsGame

An UNO game implemented in Java and used to practice object-oriented design, separation of responsibilities, and iterative refactoring. The project includes a documented redesign from an initial version into a clearer architecture.

**Link:** [CardsGame](https://github.com/h4ckxel/CardsGame)

## Systems and technical experiments

### Agujero Negro Simulador (Black Hole Simulator)

This is a Black Hole Simulator project developed primarily in **C++** using ray tracing and geodesics calculation to visualize the gravitational effects (such as gravitational lensing) of a black hole. It includes C++ source files (`ray_tracing.cpp`, `CPU-geodesic.cpp`) and shader files (`geodesic.comp`, `grid.frag`, `grid.vert`).

**Link**: [Black Hole Simulator](https://github.com/h4ckxel/agujero_negro_simulador)

### Didactic Parakeet

A computer-vision prototype for sign-language recognition built around MediaPipe. It remains an active learning project and is included here as an example of experimentation with applied machine learning and accessibility.

**Link:** [didactic-parakeet](https://github.com/h4ckxel/didactic-parakeet)
