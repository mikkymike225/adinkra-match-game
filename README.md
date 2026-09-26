# Adinkra Match Game

A playable web game for matching Ghanaian-Akan Adinkra symbols with their names and meanings.

## Matches
- DUAFE — Beauty
- OSRANE — Crescent
- NYANSAPO — Wisdom
- OWUO ATWEDEE — Mortality
- EPA — Justice
- KINTINKANTAN — Arrogance

## Level unlock rules
The admin can enable or disable score thresholds from **Admin settings** at the bottom of the page. When enabled, Level 1 requires 100% to unlock Level 2; Level 2 requires 70% to unlock Level 3; Level 3 requires 80% to unlock Level 4; Level 4 requires 100% to unlock Level 5. When disabled, players must place all pieces in a level, but any score unlocks the next level.

Level 2–5 scores count only the 20 missing pieces, so scores range from 0/20 to 20/20.

## Cloudflare Pages setup for shared admin settings
The game is static, so shared settings are stored in Cloudflare KV through a Pages Function.

1. In Cloudflare, create a KV namespace (for example, `ADINKRA_GAME_SETTINGS`).
2. Open the Pages project settings and add a KV namespace binding named `GAME_SETTINGS`, pointing to that namespace.
3. Add a secret named `ADMIN_PASSWORD` in the Pages project settings. Choose your own password.
4. Redeploy the site from `main`.

After deployment, open **Admin settings**, choose whether score thresholds are on or off, enter the admin password, and save. The setting is shared with all players. Without the KV binding and secret, the game uses the default thresholds and admins cannot save changes.

Designed for Cloudflare Pages.
