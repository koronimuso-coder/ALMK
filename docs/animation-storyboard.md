# ALMK Flow - Animation Storyboard

Ce document décrit le séquençage visuel et narratif pas-à-pas de l'expérience ALMK.

## Étape 1 : Préchargement Cinématique (Loader)
1. **État Initial :** Écran noir profond (`#030712`). Focus absolu.
2. **Le Dessin :** Le monogramme ALMK se dessine au centre via un effet de tracé SVG. Les quatre segments (A, L, M, K) se rapprochent et fusionnent.
3. **Le Flux :** Une fine ligne de données bronze traverse l'écran de gauche à droite. Des compteurs de données défilent brièvement en arrière-plan.
4. **La Narration :** Les concepts s'affichent consécutivement : `CONNECT` ➔ `VERIFY` ➔ `TRANSFER`.
5. **Le Verrouillage :** Le logo subit l'effet `almkLock`.
6. **La Révélation :** Un masque s'ouvre depuis le centre pour révéler la page d'accueil.

## Étape 2 : Transition d'Entrée du Site
1. Le fond bleu nuit de la page s'anime avec un léger gradient radial.
2. La scène WebGL "Secure Core" apparaît doucement en arrière-plan avec une rotation lente.
3. Le grand titre typographique du Hero est révélé ligne par ligne sous un masque.
4. Les contrôles du simulateur de devis s'élèvent avec un effet de cascade ordonné (stagger).
5. La barre de navigation s'estompe et descend depuis le haut de l'écran.

## Étape 3 : Séquence "Comment ça marche" (Pinned Scroll)
1. **Entrée :** Dès que la section entre dans l'écran, le scroll se bloque temporairement (pinning).
2. **Phase 1 : Devis :** Une trajectoire lumineuse s'allume. Le simulateur de démonstration effectue une simulation automatique (RollingNumber).
3. **Phase 2 : Vérification :** Un scan traverse le conteneur.
4. **Phase 3 : Paiement :** Les coordonnées de paiement fictives apparaissent avec un effet de morphing.
5. **Phase 4 : Contrôle :** Une série de cochettes de sécurité s'activent avec l'easing `almkLock`.
6. **Phase 5 : Livraison :** La transaction se termine avec l'affichage d'un reçu numérique premium et un hash de transaction blockchain simulé.

## Étape 4 : Section Mobile Money (Local Rails)
- Au repos, deux rails de lumière bronze et orange tracent des chemins depuis le bas de l'écran vers le Secure Core.
- Au survol d'un rail (ex. M-Pesa ou Airtel Money) :
  - Le rail s'épaissit et s'illumine.
  - Les rails inactifs s'estompent.
  - Les données de transfert s'affichent sous forme de flux de particules.

## Étape 5 : Révélation de Sécurité (Verify Before Transfer)
- Un scan laser vert/bronze vertical balaie la section de haut en bas.
- Les couches de sécurité s'estompent et se révèlent les unes après les autres.
- Les messages clés s'affichent, et un avertissement anti-phishing statique apparaît de façon permanente pour une lisibilité maximale.
