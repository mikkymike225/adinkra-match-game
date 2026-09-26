const DEFAULTS = { thresholdsEnabled: true };
const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status,
  headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" }
});

export async function onRequestGet({ env }) {
  if (!env.GAME_SETTINGS) return json(DEFAULTS);
  const saved = await env.GAME_SETTINGS.get("progression");
  if (!saved) return json(DEFAULTS);
  try {
    return json({ ...DEFAULTS, ...JSON.parse(saved) });
  } catch {
    return json(DEFAULTS);
  }
}

export async function onRequestPost({ request, env }) {
  if (!env.ADMIN_PASSWORD || !env.GAME_SETTINGS) {
    return json({ error: "Admin settings storage is not configured yet." }, 503);
  }
  if (request.headers.get("x-admin-password") !== env.ADMIN_PASSWORD) {
    return json({ error: "Incorrect admin password." }, 401);
  }
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid settings request." }, 400);
  }
  if (typeof body.thresholdsEnabled !== "boolean") {
    return json({ error: "Choose whether score thresholds are on or off." }, 400);
  }
  const settings = { thresholdsEnabled: body.thresholdsEnabled };
  await env.GAME_SETTINGS.put("progression", JSON.stringify(settings));
  return json(settings);
}
