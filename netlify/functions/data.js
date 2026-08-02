const { getStore } = require('@netlify/blobs');

function getBlobStore() {
  const siteID = process.env.BLOBS_SITE_ID;
  const token = process.env.BLOBS_TOKEN;
  if (siteID && token) {
    return getStore({ name: 'apartman-defteri', siteID, token });
  }
  return getStore('apartman-defteri');
}

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store, no-cache, must-revalidate'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  const store = getBlobStore();

  if (event.httpMethod === 'GET') {
    const entries = await store.get('entries', { type: 'json' });
    const daireNames = await store.get('daireNames', { type: 'json' });
    const visits = await store.get('visits', { type: 'json' });
    return { statusCode: 200, headers, body: JSON.stringify({ entries: entries || [], daireNames: daireNames || {}, visits: visits || [] }) };
  }

  if (event.httpMethod === 'POST') {
    let body;
    try {
      body = JSON.parse(event.body || '{}');
    } catch (e) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Geçersiz istek' }) };
    }

    if (body.action === 'log-visit') {
      const daire = parseInt(body.daire, 10);
      if (!daire || daire < 1 || daire > 20) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Geçersiz daire' }) };
      }
      const visits = (await store.get('visits', { type: 'json' })) || [];
      visits.push({ daire: daire, date: new Date().toISOString() });
      const trimmed = visits.slice(-200);
      await store.setJSON('visits', trimmed);
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
    }

    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword) {
      return { statusCode: 500, headers, body: JSON.stringify({ error: 'Sunucuda ADMIN_PASSWORD tanımlı değil' }) };
    }
    if (body.password !== adminPassword) {
      return { statusCode: 401, headers, body: JSON.stringify({ error: 'Yanlış şifre' }) };
    }

    if (body.action === 'verify') {
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
    }

    if (!Array.isArray(body.entries)) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Geçersiz veri' }) };
    }

    await store.setJSON('entries', body.entries);
    if (body.daireNames && typeof body.daireNames === 'object') {
      await store.setJSON('daireNames', body.daireNames);
    }
    return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
  }

  return { statusCode: 405, headers, body: JSON.stringify({ error: 'İzin verilmeyen yöntem' }) };
};
