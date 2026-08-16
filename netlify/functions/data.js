const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

async function sbGet(key) {
  const res = await fetch(SUPABASE_URL + '/rest/v1/app_data?key=eq.' + key + '&select=value', {
    headers: {
      'apikey': SUPABASE_SERVICE_KEY,
      'Authorization': 'Bearer ' + SUPABASE_SERVICE_KEY
    }
  });
  if (!res.ok) throw new Error('Supabase GET failed: ' + res.status);
  const rows = await res.json();
  return rows.length > 0 ? rows[0].value : null;
}

async function sbSet(key, value) {
  const res = await fetch(SUPABASE_URL + '/rest/v1/app_data', {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_SERVICE_KEY,
      'Authorization': 'Bearer ' + SUPABASE_SERVICE_KEY,
      'Content-Type': 'application/json',
      'Prefer': 'resolution=merge-duplicates'
    },
    body: JSON.stringify({ key: key, value: value })
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error('Supabase SET failed: ' + res.status + ' ' + text);
  }
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

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Sunucuda SUPABASE_URL veya SUPABASE_SERVICE_KEY tanımlı değil' }) };
  }

  if (event.httpMethod === 'GET') {
    try {
      const entries = await sbGet('entries');
      const daireNames = await sbGet('daireNames');
      const visits = await sbGet('visits');
      return { statusCode: 200, headers, body: JSON.stringify({ entries: entries || [], daireNames: daireNames || {}, visits: visits || [] }) };
    } catch (e) {
      return { statusCode: 500, headers, body: JSON.stringify({ error: 'Supabase okuma hatası: ' + e.message }) };
    }
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
      if (!daire || daire
