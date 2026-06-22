# ALMK Flow - Mobile & Touch Motion Design

Ce document définit les règles d'adaptation du mouvement pour les écrans tactiles de petite et moyenne taille.

## 1. Principes Directeurs Mobiles
Le mobile ne doit pas simplement être une version "réduite" ou "dégradée" du desktop. Il nécessite une chorégraphie propre qui respecte :
- L'utilisation à une seule main (le pouce) ;
- La réactivité immédiate au toucher (pas de décalage temporel lié aux easings lents) ;
- Les performances énergétiques de la batterie et les contraintes processeur.

## 2. Remplacement du Pinned Scroll et Carousel Horizontal
Le scroll horizontal forcé et le pinning prolongé sur desktop provoquent des sensations désagréables sur mobile (impression d'écran bloqué).
- **Remplacement :** Toutes les sections épinglées (comme la séquence "Comment ça marche" ou les "Réseaux blockchain") se réorganisent en une structure verticale native.
- **Révélation :** Les cartes entrent dans l'écran en fondu et léger glissement ascendant (y: 20px) déclenchés individuellement par ScrollTrigger dès leur passage dans le viewport.

## 3. Désactivation des Effets Interactifs Coûteux
- **Curseur personnalisé (Cursor Follower) :** Totalement désactivé sur mobile car il n'y a pas de pointeur souris. Le curseur système natif reste intact.
- **Effets Hover :** Tous les effets de boutons magnétiques et les lueurs de bordure au survol sont désactivés ou convertis en feedbacks tactiles instantanés lors du toucher (`onTouchStart` ou sélecteur `:active`).
- **WebGL :** Le WebGL est soit désactivé pour laisser place à la version `<WebGLFallback />` en SVG dynamique, soit limité à un rendu très léger sans reflets complexes ni calcul de post-processing.

## 4. Menu de Navigation Mobile Cinématique
Le menu mobile plein écran s'ouvre avec un effet de masque diagonal.
1. **L'ouverture :** Un volet diagonal en masque glisse du coin supérieur droit vers le coin inférieur gauche.
2. **Le Stagger :** Les liens du menu apparaissent les uns après les autres avec un délai d'apparition de 50ms par lien.
3. **Le Status :** Un rappel des informations opérationnelles en direct (statut des transferts, heure locale) s'affiche au bas du menu mobile.
