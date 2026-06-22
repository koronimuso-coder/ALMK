# ALMK Flow - Motion System

Ce document définit les fondations et la philosophie du mouvement pour l'expérience numérique ALMK.

## 1. Philosophie du Mouvement
Le mouvement d'ALMK n'est pas purement décoratif. Il sert à guider l'utilisateur, à expliquer des concepts complexes (comme le transfert d'un paiement local vers de l'USDT mondial), et à instaurer un sentiment de sécurité et de précision technologique. Nous appelons cette signature de mouvement **"ALMK Flow"**.

Le rythme d'ALMK Flow repose sur :
- Une accélération initiale fulgurante (vitesse de transfert) ;
- Une brève phase de suspension (vérification / contrôle) ;
- Un verrouillage précis à destination (sécurité et finalisation).

## 2. Vocabulaire d'Animation
- **Launch (Propulsion) :** Mouvement de départ rapide qui lance l'expérience (ex. apparition du Hero).
- **Flow (Flux) :** Mouvement continu et fluide qui accompagne le scroll ou le chargement.
- **Lock (Verrouillage) :** Alignement sec, précis et rassurant lors de la complétion d'une étape ou d'une transaction.
- **Snap (Rappel) :** Transition de position nette pour recentrer l'attention.
- **Soft (Douceur) :** Micro-interaction légère pour les éléments interactifs réguliers (boutons, formulaires).
- **Emergency (Alerte) :** Secousse brève et focus immédiat pour les erreurs.

## 3. Courbes d'Assouplissement (Easings)
Nous définissons les courbes CustomEase suivantes basées sur notre signature :
- `almkLaunch` : `M0,0 C0.16,1 0.3,1 1,1` (Accélération ultra-rapide, décélération douce).
- `almkFlow` : `M0,0 C0.25,1 0.5,1 1,1` (Scroll et transitions d'images fluides).
- `almkLock` : `M0,0 C0.3,1.25 0.6,1 1,1` (Effet de rappel élastique premium au verrouillage).
- `almkSnap` : `M0,0 C0.7,0 0.3,1 1,1` (Transition de scène nette).
- `almkSoft` : `M0,0 C0.4,0 0.2,1 1,1` (Micro-animations de formulaires).
- `almkEmergency` : `M0,0 C0.8,0 0.2,1.4 1,1` (Choc dynamique).

## 4. Durées Standards (Durations)
- **Instant :** `0.1s` / `100ms` (Changements d'états hover de base).
- **Fast :** `0.3s` / `300ms` (Mise à jour de valeurs, apparitions de tooltips).
- **Normal :** `0.5s` / `500ms` (Fermeture de modales, micro-interactions).
- **Slow :** `0.8s` / `800ms` (Transitions de pages, entrée de conteneurs).
- **Cinematic :** `1.5s` / `1500ms` (Loader initial, dévoilement de scènes 3D).

## 5. Niveaux d'Intensité (Qualité Adaptative)
- **FULL (Desktop puissant) :** WebGL actif, parallaxe prononcée, curseur personnalisé actif, animations de flou dynamique, transitions complexes.
- **BALANCED (Mobile récent / Tablette) :** Pas de curseur personnalisé, WebGL léger ou fallback SVG dynamique, parallaxe adoucie, pas d'effets de flou coûteux.
- **ESSENTIAL (Reduced Motion / Appareil faible) :** Opacités simples, transitions instantanées, aucune animation coûteuse en calcul (WebGL/Parallaxe désactivés).

## 6. Règles d'Accessibilité & Reduced Motion
- Respect strict de la préférence média `prefers-reduced-motion`.
- Toujours maintenir les attributs `aria-label` et la lisibilité du texte initial lors de l'utilisation de `SplitText`.
- Les durées de lecture des textes importants doivent rester statiques et ne pas dépendre du défilement.
- Pas de clignotements rapides (fréquence > 3Hz).
