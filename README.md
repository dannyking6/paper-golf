# Paper Golf — build hors-ligne

Golf dessiné sur papier : **trace ta frappe à la main** sur la feuille, la balle suit la
physique (Matter.js) avec vents, rampins et obstacles en papier. Parcours en le moins de coups possible.

- **Concept original** : golf minimaliste « dessiné à la main », trajectoire dessinée au trait.
- **Moteur** : Phaser 3 + Matter physics, audio Howler.
- **Portail d'origine** : GameSnacks — version ici **100 % autonome, sans SDK, sans ads, sans réseau**.

## Lancer le jeu

```bash
cd paper-golf
python3 -m http.server 8080
# puis ouvrir http://localhost:8080 dans le navigateur
```

Tout est servi depuis ce dossier : aucune requête internet n'est faite.

## Contrôles

- **Tactile / souris** : taper pour naviguer les menus ; dans le niveau, glisser depuis la balle
  (arrière = viser) puis relâcher pour frapper.

## Ce qui a été retiré / modifié

- SDK GameSnacks remplacé par un driver neutre local (`game-driver.js`) qui implémente la même
  surface API (ads factices instantanées, storage localStorage, audio, score).
- Le build multi-portails était verrouillé sur le mode GameSnacks ; le driver remplit ce rôle, le reste est du code mort.
- Aucun fichier de jeu (logique, assets, audio, bitmap fonts) n'a été altéré.

## Validation (Playwright + firewall applicatif)

- 0 erreur JS, 0 requête échouée, **0 requête externe** (firewall ; seuls des blobs `blob:127.0.0.1` same-origin générés par Howler).
- Boucle de rendu active (~22 fps mesurés en VM), menu → sélection → scène PHYSICS active.
- Preuve gameplay : geste de frappe → la balle bouge et la physique continue d'évoluer (diff 20 326 px entre captures successives).
