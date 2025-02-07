/**********************************************
 * scripts.js - Lógica de autenticación y profile
 **********************************************/

function initAuthButtons() {
  const loginBtn    = document.getElementById('loginBtn');
  const registerBtn = document.getElementById('registerBtn');

  // Asignamos listeners fijos, SIN condicionar con tokens
  if (loginBtn) {
    // Al hacer clic, vamos a /auth/login
    loginBtn.onclick = () => {
      window.location.replace('https://api.ottoapis.com/auth/login');
    };
  }
  if (registerBtn) {
    // Al hacer clic, vamos a /auth/signup (si lo tienes configurado)
    registerBtn.onclick = () => {
      window.location.replace('https://api.ottoapis.com/auth/signup');
    };
  }
}

/**
 * checkAuthAndUpdateUI()
 * - Muestra/oculta botones (login, register, logout, Mi Cuenta)
 * - Decodifica idToken para mostrar el email en userNameSpan si logueado
 */
function checkAuthAndUpdateUI() {
  const loginBtn    = document.getElementById('loginBtn');
  const registerBtn = document.getElementById('registerBtn');
  const profileLink = document.getElementById('profileLink');
  const logoutBtn   = document.getElementById('logoutBtn');
  const userNameSpan= document.getElementById('userNameSpan');

  // Leer tokens
  const accessToken = sessionStorage.getItem('accessToken');
  const idToken     = sessionStorage.getItem('idToken');

  if (accessToken && idToken) {
    // Usuario logueado => ocultamos Login/Register, mostramos Logout / Mi Cuenta
    if (loginBtn)    loginBtn.style.display    = 'none';
    if (registerBtn) registerBtn.style.display = 'none';

    if (profileLink) profileLink.style.display = 'inline-block';

    if (logoutBtn) {
      logoutBtn.style.display = 'inline-block';
      logoutBtn.onclick = () => doLogout();
    }

    // Mostramos el email del idToken (decodificación JWT)
    try {
      const decoded = jwt_decode(idToken);
      if (decoded && decoded.email) {
        userNameSpan.textContent = decoded.email;
      } else {
        userNameSpan.textContent = 'Usuario';
      }
    } catch (err) {
      console.error('Error decodificando idToken:', err);
      userNameSpan.textContent = 'Usuario';
    }

  } else {
    // Usuario NO logueado => mostrar Login/Register, ocultar Logout/Mi Cuenta
    if (loginBtn)    loginBtn.style.display    = 'inline-block';
    if (registerBtn) registerBtn.style.display = 'inline-block';
    if (profileLink) profileLink.style.display = 'none';
    if (logoutBtn)   logoutBtn.style.display   = 'none';
    if (userNameSpan) userNameSpan.textContent = '';
  }
}

/**
 * doLogout()
 * - Limpia tokens y redirige a /auth/logout
 */
function doLogout() {
  sessionStorage.clear();
  // Ajusta a tu API /auth/logout
  window.location.href = 'https://api.ottoapis.com/auth/logout';
}

/********************************************************
 * FUNCIONES PARA PROFILE (intercambio code, loadLicenses)
 ********************************************************/
function exchangeCodeForTokens(code) {
  fetch(`https://api.ottoapis.com/exchangeCode?code=${code}`)
    .then(resp => resp.json())
    .then(data => {
      if (data.error) {
        console.error("Error en /exchangeCode:", data.error);
        return;
      }
      // Guardar tokens
      sessionStorage.setItem('accessToken', data.access_token);
      sessionStorage.setItem('idToken',     data.id_token);

      // Quitar ?code= de la URL
      window.history.replaceState({}, document.title, window.location.pathname);

      // Actualizamos la UI y cargamos licencias
      checkAuthAndUpdateUI();
      loadLicenses(data.access_token);
    })
    .catch(err => {
      console.error("Error en intercambio de code:", err);
    });
}

function loadLicenses(accessToken) {
  const decoded = jwt_decode(accessToken);
  const userSub = decoded.sub;
  if (!userSub) {
    console.error("Token sin 'sub'");
    return;
  }

  // GET /usuarios/{userSub}/licencias con Bearer
  const url = `https://api.ottoapis.com/usuarios/${userSub}/licencias`;
  fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` }
  })
  .then(r => r.json())
  .then(data => {
    const licenses = data.items || data;
    renderLicenses(licenses);
  })
  .catch(err => console.error("Error al cargar licencias:", err));
}

function renderLicenses(licenses) {
  // Definimos 'now' al inicio de la función
  const now = new Date();

  const tbody = document
    .getElementById('licensesTable')
    .querySelector('tbody');

  tbody.innerHTML = '';

  licenses.forEach(lic => {
    const tr = document.createElement('tr');

    // Nombre
    const tdName = document.createElement('td');
    tdName.textContent = lic.name || lic.product_id || 'N/A';
    tr.appendChild(tdName);

    // Status
    const tdStatus = document.createElement('td');
    if (lic.expires_at) {
      const expDate = new Date(lic.expires_at);
      tdStatus.textContent = (expDate > now) ? 'Activa' : 'Inactiva';
    } else {
      tdStatus.textContent = 'Desconocido';
    }
    tr.appendChild(tdStatus);

    // Fecha de vencimiento
    const tdExp = document.createElement('td');
    tdExp.textContent = lic.expires_at || '';
    tr.appendChild(tdExp);

    // Días restantes
    const tdDays = document.createElement('td');
    if (lic.expires_at) {
      const diffMs = new Date(lic.expires_at) - now;
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      tdDays.textContent = (diffDays <= 0) ? 'Expirada' : diffDays;
    } else {
      tdDays.textContent = '';
    }
    tr.appendChild(tdDays);

    tbody.appendChild(tr);
  });
}
