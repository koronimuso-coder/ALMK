# ALMK Flow - Animation Accessibility (A11y)

Ce document décrit comment le système d'animation ALMK garantit une expérience inclusive pour tous les utilisateurs, notamment ceux utilisant des technologies d'assistance ou sensibles aux mouvements.

## 1. Respect du mode Reduced Motion
Nous écoutons l'état du système via la règle média `prefers-reduced-motion: reduce`.
Dès que cette option est détectée :
- Le défilement doux (Smooth Scroll) est immédiatement désactivé pour laisser place au défilement natif du navigateur.
- Les grands déplacements spatiaux (ex. glissement de cartes, zoom, parallaxe) sont convertis en transitions d'opacité (fade) ultra-courtes (max 150ms).
- Les animations de texte lettre par lettre ou mot par mot sont converties en affichage de bloc direct ou fondu simple.
- Les scènes WebGL animées sont stoppées à leur frame initiale ou remplacées par une image clé statique.

## 2. Accessibilité de `SplitText`
L'utilisation de GSAP pour découper des textes présente un risque majeur de morcellement pour les lecteurs d'écran (qui liront les lettres ou mots séparément).
**Règle d'implémentation ALMK :**
Pour chaque composant de texte animé (ex. `<SplitReveal />`) :
1. Conserver le texte d'origine dans un conteneur accessible avec l'attribut `aria-label="Texte Complet"`.
2. Masquer le conteneur découpé par GSAP aux lecteurs d'écran en utilisant `aria-hidden="true"`.
```html
<h1 aria-label="Achetez vos USDT">
  <span aria-hidden="true">A</span>
  <span aria-hidden="true">c</span>
  <!-- etc -->
</h1>
```

## 3. Navigation Clavier & Focus
- Les carousels et galeries horizontales ne doivent pas capturer le focus de manière infinie. L'utilisateur doit pouvoir sauter la section au clavier.
- Le smooth scrolling ne doit jamais perturber ou retarder le déplacement naturel du focus clavier (`Tab`).
- Le bouton "Voir toutes les étapes" ou "Passer" doit être directement accessible dès le premier élément focusable de la section.

## 4. Prévention des Troubles Vestibulaires
- Pas d'effet de "Scroll Hijacking" agressif qui modifie la vitesse ou la direction attendue du scroll de manière surprenante.
- Aucune animation de clignotement ou de flash rapide n'est autorisée sur le site afin de prévenir les crises d'épilepsie photosensible.
- Les mouvements horizontaux à grande échelle ne doivent pas occuper plus de 50% de la hauteur de l'écran sans offrir une alternative de désactivation.
