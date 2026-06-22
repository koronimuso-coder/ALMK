# ALMK Flow - Animation Inventory Report

Ce document dresse l'inventaire précis de chaque animation réellement développée dans le projet ALMK, conformément aux critères du cahier des charges.

## Inventaire Complet des Animations

| Route | Composant | Fichier | Plugin / Outil | Déclencheur | Fallback | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `/` | `Loader` | [page.tsx](file:///c:/Users/NYAMMA/ALMK/src/app/page.tsx) | SVG Stroke Dasharray | `onload` | Rendu instantané | Opérationnel |
| `/` | `Hero Title` | [page.tsx](file:///c:/Users/NYAMMA/ALMK/src/app/page.tsx) | `SplitText` | Entrée page | Fade simple | Opérationnel |
| `/` | `Secure Core 3D` | [WebGLScene.tsx](file:///c:/Users/NYAMMA/ALMK/src/components/motion/WebGLScene.tsx) | Three.js (Dynamic) | Immédiat | SVG `WebGLFallback` | Opérationnel |
| `/` | `WebGL Fallback` | [WebGLFallback.tsx](file:///c:/Users/NYAMMA/ALMK/src/components/motion/WebGLFallback.tsx) | SVG CSS Keyframes | Reduced Motion | Lignes statiques | Opérationnel |
| `/` | `Simulator Flip` | [page.tsx](file:///c:/Users/NYAMMA/ALMK/src/app/page.tsx) | `Flip` | Click Devise | Changement instantané | Opérationnel |
| `/` | `Rolling Number` | [RollingNumber.tsx](file:///c:/Users/NYAMMA/ALMK/src/components/motion/RollingNumber.tsx) | GSAP Core | Value Update | Valeur brute | Opérationnel |
| `/` | `How-To Scroll` | [page.tsx](file:///c:/Users/NYAMMA/ALMK/src/app/page.tsx) | `ScrollTrigger` | Scroll | Alignement direct | Opérationnel |
| `/` | `Local Rails` | [page.tsx](file:///c:/Users/NYAMMA/ALMK/src/app/page.tsx) | `DrawnPath` / Core | Hover / Mouse | Lignes statiques | Opérationnel |
| `/` | `Networks Grid` | [page.tsx](file:///c:/Users/NYAMMA/ALMK/src/app/page.tsx) | `StaggerGrid` | Viewport | Entrée brute | Opérationnel |
| `/` | `Security Scan` | [page.tsx](file:///c:/Users/NYAMMA/ALMK/src/app/page.tsx) | Core timeline | Submit console | Révélation instantanée| Opérationnel |
| `/` | `Page Transition`| [PageTransition.tsx](file:///c:/Users/NYAMMA/ALMK/src/components/motion/PageTransition.tsx) | Core clipPath | Clic lien interne | Changement brut | Opérationnel |
| `/` | `Custom Cursor` | [CursorFollower.tsx](file:///c:/Users/NYAMMA/ALMK/src/components/motion/CursorFollower.tsx) | Mouvement souris | Pointer: Fine | Curseur natif | Opérationnel |
| `/` | `Magnetic Button`| [MagneticButton.tsx](file:///c:/Users/NYAMMA/ALMK/src/components/motion/MagneticButton.tsx) | Core | Hover | Hover CSS simple | Opérationnel |
| `/dashboard` | `Stats Counter`| [dashboard/page.tsx](file:///c:/Users/NYAMMA/ALMK/src/app/dashboard/page.tsx) | `AnimatedCounter` | Entrée page | Rendu brut | Opérationnel |
| `/dashboard` | `Status badge` | [AnimatedStatus.tsx](file:///c:/Users/NYAMMA/ALMK/src/components/motion/AnimatedStatus.tsx) | Core loops | Statut actif | Badge statique | Opérationnel |
| `/status` | `Uptime Pulse` | [status/page.tsx](file:///c:/Users/NYAMMA/ALMK/src/app/status/page.tsx) | CSS Keyframes | Immédiat | Point vert fixe | Opérationnel |
| `*` | `404 Broken Path`| [not-found.tsx](file:///c:/Users/NYAMMA/ALMK/src/app/not-found.tsx) | `DrawnPath` | Entrée page | Image statique | Opérationnel |
