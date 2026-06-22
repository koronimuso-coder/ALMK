# ALMK Flow - Animation Performance Guidelines

Ce document décrit les règles techniques pour maintenir un framerate de 60 FPS stable lors de l'exécution des animations ALMK Flow.

## 1. Propriétés autorisées pour l'animation
Pour éviter les recalculs de layout et les repaintings lourds, nous limitons les propriétés animées en continu aux suivantes :
- `transform` (utilisant `x`, `y`, `z`, `scale`, `rotation`, `skew`) ;
- `opacity` ;
- `clip-path` (uniquement sur les GPU supportés et avec modération).

**PROHIBÉ en animation continue :** `width`, `height`, `top`, `left`, `margin`, `padding`, `box-shadow`, `filter: blur()`, `backdrop-filter`. Ces propriétés causent du Layout Thrashing.

## 2. Règle de Qualité Adaptative (FPS Monitor)
1. **Mesure initiale :** Lors du chargement, nous exécutons une boucle de calcul de FPS pendant 1,5 seconde.
2. **Dégradation automatique :**
   - Si FPS moyen < 45 : Passage automatique en mode **BALANCED** (désactivation du WebGL complexe, parallaxe douce).
   - Si FPS moyen < 30 : Passage automatique en mode **ESSENTIAL** (remplacement de toutes les animations par des opacités simples ou désactivation complète).
3. **Mise en veille hors écran :** Tous les ScrollTriggers et les scènes WebGL doivent être stoppés/suspendus lorsque leur conteneur n'est plus visible dans le viewport (`intersectionObserver` ou ScrollTrigger native sleep).

## 3. Gestion de `will-change`
- N'appliquez jamais `will-change` de façon permanente sur des dizaines d'éléments (cela sature la mémoire GPU).
- **Règle ALMK :** Appliquer `will-change: transform, opacity` uniquement au survol d'un conteneur ou juste avant le déclenchement d'une timeline, et le retirer une fois l'animation terminée (`onComplete` de GSAP).

## 4. Optimisation WebGL (Three.js)
- Import dynamique de Three.js uniquement si le terminal supporte WebGL.
- Limiter le ratio de pixels à un maximum de `1.5` ou `2` (`Math.min(window.devicePixelRatio, 2)`).
- Les géométries du "Secure Core" doivent utiliser des formes simples à faible nombre de sommets (Low Poly / Line meshes).
- Pas de textures 4K. Utilisation de shaders mathématiques simples ou de textures vectorielles légères.
