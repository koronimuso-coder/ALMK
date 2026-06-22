# ALMK Flow - Animation Inventory

Ce tableau répertorie l'ensemble des animations intégrées dans le système ALMK, leur fonction, leurs plugins associés et leurs comportements adaptatifs.

| Page | Section | Nom | Objectif UX | Déclencheur | Plugin | Durée | Easing | Propriétés | Mobile | Reduced Motion | Fallback | Performance | Test |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| Toutes | Init | Cinematic Loader | Captiver & Précharger | Chargement | DrawSVG / Core | 1.8s | almkLock | opacity, stroke-dashoffset | Simplifié | Fade court | Simple CSS Loader | Faible | Rendu correct et disparition |
| Accueil | Hero | Secure Core 3D | Immerger & Rassurer | Immédiat | Three.js / WebGL | Indéfini | almkFlow | rotation, scale | Fallback 2D | Statique | SVG Statique | Moyen | Détection FPS et dégradation |
| Accueil | Hero | Typography Split | Structurer & Guider | Entrée de page | SplitText | 0.8s | almkLaunch | clip-path, y, opacity | Split par lignes | Fade simple | Affichage brut | Faible | Pas de décalage de mise en page |
| Accueil | Hero | Custom Cursor | Guider l'interaction | Mouvement souris | Core | 0.2s | almkFlow | x, y, scale, color | Désactivé | Désactivé | Curseur système | Très faible | Disparition sur boutons de formulaire |
| Accueil | Hero | Simulator Flip | Simplifier la saisie | Choix devise | Flip | 0.4s | almkSoft | x, y, width, height | Identique | Instantané | Remplacement direct | Faible | Alignement parfait des conteneurs |
| Accueil | Hero | Rolling Numbers | Dynamiser les taux | Calcul devis | Core | 0.6s | almkSoft | textContent / position | Identique | Instantané | Remplacement brut | Faible | Accessibilité aria-live correcte |
| Accueil | How-to | Pinned Story | Expliquer pas-à-pas | Scroll | ScrollTrigger | 2.5s | almkFlow | y, drawPath, opacity | Défilement natif | Révélation directe | Cartes statiques | Moyen | Désactivation du smooth scroll |
| Accueil | Rails | Local Rails | Connecter local/global | Hover / Scroll | DrawSVG / Core | 0.8s | almkFlow | stroke-dashoffset, opacity | Tap interaction | Statique | Lignes fixes | Faible | Éclairage du rail sélectionné |
| Accueil | Networks| Horizontal Scroll | Varier le rythme | Scroll | ScrollTrigger | 1.2s | almkSnap | x, scale, rotation | Scroll vertical | Cartes empilées | Carousel standard | Moyen | Navigation clavier valide |
| Accueil | Security| Security Scan | Démontrer la rigueur | Visibilité | ScrollTrigger | 1.0s | almkFlow | y (laser line), opacity | Identique | Désactivé | Révélation directe | Faible | Lisibilité du message anti-phishing |
| Accueil | Verify | Terminal Verify | Vérifier un contact | Validation input | MorphSVG / Core | 0.6s | almkLock | morphPath, color, scale | Identique | Instantané | Changement brut | Faible | Rapidité de réponse (<600ms) |
| App | Dashboard | Stagger Entry | Clarté visuelle | Chargement route | Core | 0.5s | almkLaunch | opacity, y | Identique | Instantané | Rendu direct | Faible | Aucun clignotement initial |
| Toutes | Route | Page Gate | Naviguer de façon fluide| Clic lien interne | Flip / Mask | 0.7s | almkSnap | clip-path, opacity | Simplifié | Fade court | Changement standard | Faible | Aucun blocage d'historique |
