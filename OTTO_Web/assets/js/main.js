// main.js (Ajustado)

// Obtenemos referencias a los botones
const loginBtn    = document.getElementById('login');
const registerBtn = document.getElementById('registerBtn');

try {
  // Verificamos si hay tokens en sessionStorage
  const accessToken = sessionStorage.getItem('accessToken');
  const idToken     = sessionStorage.getItem('idToken');

  if (accessToken && idToken) {
    // Usuario logueado
    loginBtn.textContent = 'Logout';
    loginBtn.onclick = () => {
      sessionStorage.clear();
      window.location.replace('https://api.ottoapis.com/auth/logout');
    };

    // (Opcional) ocultas el registerBtn si ya estás logueado
    if (registerBtn) {
      registerBtn.style.display = 'none';
    }

  } else {
    // Usuario no logueado
    loginBtn.textContent = 'Login';
    loginBtn.onclick = () => {
      window.location.replace('https://api.ottoapis.com/auth/login');
    };

    // Manejo de Signup
    if (registerBtn) {
      registerBtn.onclick = () => {
        window.location.replace('https://api.ottoapis.com/auth/signup');
      };
    }
  }

  // Mostrar los botones al final
  if (loginBtn)    loginBtn.style.visibility    = 'visible';
  if (registerBtn) registerBtn.style.visibility = 'visible';

} catch (err) {
  alert('No se pudo inicializar la aplicación.');
  console.error(err);
}
