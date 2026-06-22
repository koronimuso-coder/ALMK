# ALMK Flow - WebGL & 3D Strategy

Ce document détaille l'implémentation technique de la scène 3D interactive "Secure Core" et de ses solutions de repli (fallbacks).

## 1. Concept du "Secure Core"
Le "Secure Core" symbolise le noyau de sécurité ALMK. Il est composé de :
- Un monogramme ALMK central stylisé en 3D réfléchissante (matériau bronze/cuivre gold) ;
- Trois anneaux concentriques tournant sur des axes différents (simulant les couches d'identité, de paiement et de réseau) ;
- Un nuage de particules représentant les paquets de données en cours de validation ;
- Des faisceaux lumineux ou lasers connectant le noyau aux "rails locaux" lors de l'interaction utilisateur.

## 2. Architecture & Chargement Dynamique
Pour préserver le temps de chargement initial :
1. **Initialisation ultra-rapide :** Le squelette de la page d'accueil affiche un fallback SVG de haute qualité imitant le noyau en 2D.
2. **Chargement différé :** Three.js et les scripts de la scène 3D sont chargés de manière asynchrone après le déclenchement de l'événement `DOMContentLoaded` et l'affichage complet du Hero.
3. **Suspension d'activité :** La boucle d'animation (`requestAnimationFrame`) et le rendu WebGL sont stoppés dès que le composant sort de l'écran ou si l'onglet du navigateur est masqué (`document.hidden`).

## 3. Spécifications Techniques
- **Moteur :** Three.js standard (sans React Three Fiber pour minimiser l'abstraction et le poids du bundle).
- **Rendu :** `WebGLRenderer` avec `antialias: true` et gestion optimisée du pixel ratio (plafonné à 2 pour éviter les surchauffes sur les écrans Retina à ultra-haute résolution).
- **Matériaux :** `MeshStandardMaterial` ou `MeshBasicMaterial` avec des couleurs HSL personnalisées, évitant l'utilisation de textures d'images lourdes au profit de gradients mathématiques et d'effets néon.

## 4. Stratégie de Fallback (WebGL désactivé ou faible performance)
Si le navigateur ne supporte pas WebGL ou si la détection de FPS chute sous le seuil critique :
- La scène WebGL est démontée proprement (destruction des textures, géométries et contextes pour éviter les fuites de mémoire).
- Le composant affiche `<WebGLFallback />` : un canvas 2D ou un SVG interactif qui simule la rotation lente du noyau à l'aide d'animations CSS ou de tracés GSAP légers.
- Toutes les fonctionnalités de conversion du simulateur restent 100% utilisables.
