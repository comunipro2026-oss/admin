// ── GESTIÓN DE PICTOGRAMAS — AdminComuniCAP ──────────────────────────
const PICTO_URL = 'https://lgpqyjevdwstbnerawmp.supabase.co';
const PICTO_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxncHF5amV2ZHdzdGJuZXJhd21wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcyMzM1OTgsImV4cCI6MjA5MjgwOTU5OH0.GMPbwHdxj_aRLaJgDHCkDA5L1KHAwLJLkO9LYOpI8pA';

async function cargarPictogramas() {
  var app = document.getElementById('picto-app-filter').value;
  var cat = document.getElementById('picto-cat-filter').value;
  var lista = document.getElementById('picto-lista');
  lista.innerHTML = '<div style="padding:16px;color:#aaa;">Cargando...</div>';

  var query = PICTO_URL + '/rest/v1/pictogramas?order=categoria,orden&select=*';
  if (app) query += '&app=eq.' + app;
  if (cat) query += '&categoria=eq.' + encodeURIComponent(cat);

  var res = await fetch(query, { headers: { apikey: PICTO_KEY, Authorization: 'Bearer ' + PICTO_KEY } });
  var data = await res.json();

  if (!data.length) { lista.innerHTML = '<div style="padding:16px;color:#aaa;">Sin pictogramas</div>'; return; }

  var cats = {};
  data.forEach(function(p) { if (!cats[p.categoria]) cats[p.categoria] = []; cats[p.categoria].push(p); });

  var html = '';
  Object.entries(cats).forEach(function(entry) {
    var catNom = entry[0];
    var items = entry[1];
    html += '<div style="margin-bottom:20px;">';
    html += '<div style="font-weight:700;color:#3a86ff;margin-bottom:8px;font-size:0.9rem;text-transform:uppercase;">' + catNom + '</div>';
    html += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:8px;">';
    items.forEach(function(p) {
      var opacity = p.activo ? '1' : '0.4';
      var frase = p.frase || '';
      var toggleBg = p.activo ? '#ff9800' : '#06d6a0';
      var toggleIcon = p.activo ? '\uD83D\uDEAB' : '\u2705';
      var etiLabel = (p.etiqueta || '').replace(/\\/g, '\\\\').replace(/'/g, "\\'");
      var fraseEsc = frase.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
      html += '<div style="background:#1e293b;border:1px solid #334155;border-radius:8px;padding:10px;text-align:center;opacity:' + opacity + ';">';
      html += '<div style="font-size:2rem;">' + p.emoji + '</div>';
      html += '<div style="font-size:0.75rem;font-weight:600;color:#e2e8f0;margin:4px 0;">' + (p.etiqueta || '') + '</div>';
      html += '<div style="font-size:0.65rem;color:#94a3b8;margin-bottom:8px;">' + frase + '</div>';
      html += '<div style="display:flex;gap:4px;justify-content:center;">';
      html += '<button onclick="editarPicto(\'' + p.id + '\',\'' + p.app + '\',\'' + p.categoria + '\',\'' + p.emoji + '\',\'' + etiLabel + '\',\'' + fraseEsc + '\',' + p.orden + ')" style="background:#3a86ff;border:none;border-radius:4px;color:white;padding:3px 8px;font-size:0.65rem;cursor:pointer;">\u270F\uFE0F</button>';
      html += '<button onclick="togglePicto(\'' + p.id + '\',' + (p.activo ? 'true' : 'false') + ')" style="background:' + toggleBg + ';border:none;border-radius:4px;color:white;padding:3px 8px;font-size:0.65rem;cursor:pointer;">' + toggleIcon + '</button>';
      html += '<button onclick="eliminarPicto(\'' + p.id + '\',\'' + etiLabel + '\')" style="background:#ef4444;border:none;border-radius:4px;color:white;padding:3px 8px;font-size:0.65rem;cursor:pointer;">\uD83D\uDDD1\uFE0F</button>';
      html += '</div></div>';
    });
    html += '</div></div>';
  });
  lista.innerHTML = html;
}

async function guardarPicto() {
  var id = document.getElementById('picto-edit-id').value;
  var payload = {
    app: document.getElementById('picto-edit-app').value,
    categoria: document.getElementById('picto-edit-cat').value.trim(),
    emoji: document.getElementById('picto-edit-emoji').value.trim(),
    etiqueta: document.getElementById('picto-edit-etiqueta').value.trim(),
    frase: document.getElementById('picto-edit-frase').value.trim() || null,
    orden: parseInt(document.getElementById('picto-edit-orden').value) || 0,
    activo: true
  };
  if (!payload.emoji || !payload.etiqueta || !payload.categoria) {
    alert('Emoji, etiqueta y categoría son obligatorios'); return;
  }
  var url = PICTO_URL + '/rest/v1/pictogramas' + (id ? '?id=eq.' + id : '');
  var method = id ? 'PATCH' : 'POST';
  var res = await fetch(url, {
    method: method,
    headers: { apikey: PICTO_KEY, Authorization: 'Bearer ' + PICTO_KEY, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
    body: JSON.stringify(payload)
  });
  if (res.ok || res.status === 204) {
    limpiarFormPicto();
    cargarPictogramas();
  } else {
    alert('Error al guardar: ' + res.status);
  }
}

function editarPicto(id, app, cat, emoji, etiqueta, frase, orden) {
  document.getElementById('picto-edit-id').value = id;
  document.getElementById('picto-edit-app').value = app;
  document.getElementById('picto-edit-cat').value = cat;
  document.getElementById('picto-edit-emoji').value = emoji;
  document.getElementById('picto-edit-etiqueta').value = etiqueta;
  document.getElementById('picto-edit-frase').value = frase;
  document.getElementById('picto-edit-orden').value = orden;
  document.getElementById('picto-form-title').textContent = 'Editar Pictograma';
  document.getElementById('picto-form').scrollIntoView({ behavior: 'smooth' });
}

function limpiarFormPicto() {
  document.getElementById('picto-edit-id').value = '';
  document.getElementById('picto-edit-app').value = 'comunicap';
  document.getElementById('picto-edit-cat').value = '';
  document.getElementById('picto-edit-emoji').value = '';
  document.getElementById('picto-edit-etiqueta').value = '';
  document.getElementById('picto-edit-frase').value = '';
  document.getElementById('picto-edit-orden').value = '0';
  document.getElementById('picto-form-title').textContent = 'Nuevo Pictograma';
}

async function togglePicto(id, activo) {
  await fetch(PICTO_URL + '/rest/v1/pictogramas?id=eq.' + id, {
    method: 'PATCH',
    headers: { apikey: PICTO_KEY, Authorization: 'Bearer ' + PICTO_KEY, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
    body: JSON.stringify({ activo: !activo })
  });
  cargarPictogramas();
}

async function eliminarPicto(id, etiqueta) {
  if (!confirm('Eliminar "' + etiqueta + '"?')) return;
  await fetch(PICTO_URL + '/rest/v1/pictogramas?id=eq.' + id, {
    method: 'DELETE',
    headers: { apikey: PICTO_KEY, Authorization: 'Bearer ' + PICTO_KEY }
  });
  cargarPictogramas();
}
