# Adinkra Match Game

A playable web game for matching Ghanaian-Akan Adinkra symbols with their names and meanings.

## Level unlock rules

An owner or admin can enable or disable score thresholds from the **Admin** area. When enabled, Level 1 requires 100% to unlock Level 2; Level 2 requires 70% to unlock Level 3; Level 3 requires 80% to unlock Level 4; Level 4 requires 100% to unlock Level 5. When disabled, players still place all pieces, but any score unlocks the next level.

Level 2–5 scores count the 20 missing pieces, so scores range from 0/20 to 20/20. After submitting, correctly placed missing pieces show a green outline and check mark; the result shows the score and a retry button without revealing the correct answers.

## Cloudflare Pages setup

Shared settings, admin accounts, and sign-in sessions use Cloudflare KV through Pages Functions.

1. Create a KV namespace in Cloudflare.
2. In the Pages project, add a KV namespace binding named `GAME_SETTINGS` and connect it to that namespace.
3. Add a Pages environment variable named `OWNER_EMAIL` with the owner's email address.
4. Add a Pages secret named `OWNER_PASSWORD` with a strong password of at least 12 characters. This is the owner sign-in.
5. Remove the old `ADMIN_PASSWORD` secret if it exists; it is no longer used.
6. Redeploy the site from `main`.

After deployment, sign in from the **Admin sign in** button. The owner sees **Settings** and **Manage admins** tabs, can change the shared progression setting, and can add or remove admin accounts. Admins can change settings but cannot manage accounts. No public account registration is available.

