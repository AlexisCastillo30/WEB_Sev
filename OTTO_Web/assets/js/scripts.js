// scripts.js

function checkAuthAndUpdateUI() {
  const loginBtn    = document.getElementById('loginBtn');
  const registerBtn = document.getElementById('registerBtn');
  const profileLink = document.getElementById('profileLink');
  const logoutBtn   = document.getElementById('logoutBtn');
  const userNameSpan= document.getElementById('userNameSpan');

  const accessToken = sessionStorage.getItem('accessToken');
  const idToken     = sessionStorage.getItem('idToken');

  if (accessToken && idToken) {
    // Usuario logueado
    if (loginBtn)    loginBtn.style.display    = 'none';
    if (registerBtn) registerBtn.style.display = 'none';
    if (profileLink) profileLink.style.display = 'inline-block';
    if (logoutBtn)   logoutBtn.style.display   = 'inline-block';

    try {
      const decoded = jwt_decode(idToken);
      if (decoded && decoded.email && userNameSpan) {
        userNameSpan.textContent = decoded.email;
      } else if (userNameSpan) {
        userNameSpan.textContent = 'Usuario';
      }
    } catch (err) {
      console.error('Error decodificando idToken:', err);
      if (userNameSpan) userNameSpan.textContent = 'Usuario';
    }

  } else {
    // Usuario NO logueado
    if (loginBtn)    loginBtn.style.display    = 'inline-block';
    if (registerBtn) registerBtn.style.display = 'inline-block';
    if (profileLink) profileLink.style.display = 'none';
    if (logoutBtn)   logoutBtn.style.display   = 'none';
    if (userNameSpan) userNameSpan.textContent = '';
  }
}

function doLogout() {
  // Limpia tokens
  sessionStorage.clear();
  // Redirige a la Lambda (API) para logout
  window.location.href = 'https://api.ottoapis.com/auth/logout';
}
