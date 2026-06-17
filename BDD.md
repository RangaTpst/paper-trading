# Scénarios BDD — Paper Trading

Ce document liste tous les scénarios de test au format **Given / When / Then**, en français, pour être lisibles par n'importe qui (même sans lire le code).

Chaque scénario correspond à un test dans `src/tests/unit/`.

---

## T01 — Solde (`solde.test.ts`)

**Fonctionnalité** : le portefeuille doit toujours refléter le bon solde en USDT.

| Scénario | Given | When | Then |
|---|---|---|---|
| Solde initial | un nouveau portefeuille créé avec 10 000 USDT | rien | le solde affiché est 10 000 |
| Achat | solde de 10 000 USDT | achat de 0.1 BTC à 40 000 USDT | le solde diminue de 4 004 USDT (montant + frais) |
| Solde insuffisant | solde de 1 000 USDT | tentative d'achat à 50 000 USDT | une erreur "Solde insuffisant" est levée |

---

## T02 — Fréquence de trading (`frequence.test.ts`)

**Fonctionnalité** : mesurer à quelle fréquence l'utilisateur passe des ordres.

| Scénario | Given | When | Then |
|---|---|---|---|
| Fréquence par jour | 5 trades répartis sur 3 jours | calcul de la fréquence par jour | résultat ≈ 1.67 trades/jour |
| Aucune activité | aucun trade enregistré | calcul de la fréquence | résultat = 0 |
| Fréquence par semaine | trades répartis sur 2 semaines | calcul de la fréquence par semaine | le comptage par semaine est correct |

---

## T03 — Mock de l'API (`mock-api.test.ts`)

**Fonctionnalité** : tester le comportement face à l'API Binance sans faire de vrais appels réseau.

| Scénario | Given | When | Then |
|---|---|---|---|
| Réponse simulée | une réponse Binance simulée (mock) | appel de `getPrice` | le prix retourné est un `number` (pas une string) |
| API indisponible | l'API simulée répond une erreur 503 | appel de `getPrice` | une erreur "Binance API indisponible" est levée |
| Pas de réseau | le `fetch` simulé échoue (pas de connexion) | appel de `getPrice` | une erreur est levée |

---

## T04 — Validation des types API (`types-api.test.ts`)

**Fonctionnalité** : Binance retourne des nombres sous forme de texte (string) ; l'app doit les convertir en `number`.

| Scénario | Given | When | Then |
|---|---|---|---|
| Conversion du prix | un prix reçu en string `"43000.50"` | parsing via `parseTicker` | le prix est bien un `number` (43000.5) |
| Conversion d'une bougie (kline) | une bougie Binance brute (tableau de strings) | parsing via `parseKline` | open/close sont des `number` |
| Champ manquant | un ticker sans champ `price` | parsing via `parseTicker` | une erreur est levée |

---

## T05 — Gains / Pertes (`gain.test.ts`)

**Fonctionnalité** : calculer le profit ou la perte réelle d'un trade (P&L), frais inclus.

| Scénario | Given | When | Then |
|---|---|---|---|
| Trade gagnant | achat à 40 000, vente à 43 000 | calcul du P&L | gain net ≈ 291.7 USDT (frais déduits) |
| Trade perdant | achat à 40 000, vente à 38 000 | calcul du P&L | le résultat est négatif (perte) |
| Aucun trade | aucun trade dans l'historique | calcul du P&L | le résultat est 0 |

---

## T06 — Frais (`fees.test.ts`)

**Fonctionnalité** : appliquer le bon taux de frais selon le mode de paiement.

| Scénario | Given | When | Then |
|---|---|---|---|
| Taux standard | un ordre de 1 000 USDT | frais au taux standard (0.1%) | frais = 1 USDT |
| Taux réduit BNB | un ordre de 1 000 USDT | frais payés en BNB (0.075%) | frais = 0.75 USDT |
| Montant invalide | un montant négatif | calcul des frais | une erreur est levée |

---

## Portefeuille (`portfolio.test.ts`)

**Fonctionnalité** : ouverture/fermeture de positions après achat ou vente.

| Scénario | Given | When | Then |
|---|---|---|---|
| Portefeuille vide | un nouveau portefeuille | création | aucune position, aucun historique |
| Ouverture de position | portefeuille vide | achat de BTC | une position BTC apparaît |
| Fermeture de position | une position BTC ouverte | vente de toute la quantité | la position disparaît |
| Vente impossible | aucune position ETH | tentative de vente d'ETH | erreur "Position introuvable" |

---

## Statistiques (`stats.test.ts`)

**Fonctionnalité** : agréger les frais et la valeur totale du portefeuille.

| Scénario | Given | When | Then |
|---|---|---|---|
| Total des frais | 3 trades avec des frais différents | somme des frais | total correct (addition simple) |
| Valeur du portefeuille | solde + une position ouverte | calcul de la valeur totale | solde + (quantité × prix actuel) |
| Pas de position | solde seul, aucune position | calcul de la valeur totale | la valeur = le solde |

---

## Cycle TDD suivi

```
RED      → on écrit le test, il échoue (la fonction n'existe pas encore)
GREEN    → on écrit le code minimum pour faire passer le test
REFACTOR → on nettoie le code et les tests sans changer le comportement
```

Chaque ligne de ce tableau est un test unique dans le code, exécutable avec :

```bash
npm run test
```
