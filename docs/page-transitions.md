# ALMK Flow - Page Transitions ("The Secure Gate")

Ce document détaille le fonctionnement du système de transition cinématique entre les routes d'ALMK.

## 1. Concept de "The Secure Gate"
Lors d'un changement de page interne, le passage ne doit pas se faire de manière brutale ou par un simple écran blanc. "The Secure Gate" est une transition masquée simulant la fermeture d'un sas de sécurité, le changement de données en arrière-plan, puis l'ouverture du sas sur la nouvelle page.

## 2. Chronologie de la Transition (Timeline)
La transition dure entre 600ms et 900ms et se décompose comme suit :
1. **Événement Déclencheur :** Clic sur un lien interne ou changement de route programmé. Le lien actif se verrouille (l'utilisateur ne peut plus double-cliquer).
2. **Phase de Fermeture (0ms - 350ms) :**
   - Une impulsion lumineuse (ligne bronze) part du point de clic et se propage vers le centre.
   - Un masque diagonal sombre (`#030712`) se referme rapidement sur l'écran en utilisant l'easing `almkSnap`.
3. **Phase de Mutation (350ms - 450ms) :**
   - Le contenu de la route précédente est démonté, la nouvelle route est chargée.
   - Le scroll de la fenêtre est réinitialisé au sommet (ou restauré selon l'historique).
   - Le titre principal de la nouvelle page est préparé en arrière-plan sous son masque.
4. **Phase d'Ouverture (450ms - 800ms) :**
   - Le masque se sépare et se retire de l'écran.
   - Le nouveau titre est révélé ligne par ligne à l'aide de `SplitText` avec l'easing `almkLaunch`.
   - La navigation se compresse ou s'ajuste selon la page de destination.

## 3. Intégration Next.js App Router
Nous interceptons les clics sur les liens via un composant de transition personnalisé (`<PageTransition />`) combinant :
- Un composant de gestion de route (via `usePathname` et `useRouter`) ;
- Un wrapper de mise en cache pour garder la page précédente affichée pendant la fermeture du masque ;
- La réinitialisation propre et systématique de tous les plugins et instances globaux de `ScrollTrigger` (`ScrollTrigger.killAll()`) pour éviter les triggers orphelins.

## 4. Règles de Sécurité de Navigation
- Si la transition bloque ou rencontre une erreur JS pendant plus de 1,2 seconde, la transition est immédiatement interrompue et forcée à s'ouvrir (fail-safe) pour ne jamais bloquer l'utilisateur.
- Pas de transition lors de l'ouverture de liens dans un nouvel onglet (`Ctrl+Clic`).
- Pas de transition sur les formulaires de paiement en cours afin d'éviter toute perte de données accidentelle.
