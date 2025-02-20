function buyPlan(plan) {
    const accessToken = sessionStorage.getItem('accessToken');
    if (!accessToken) {
      alert("Por favor inicia sesión para comprar.");
      return;
    }
  
    fetch('https://api.ottoapis.com/licenses/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({ plan })
    })
      .then(resp => resp.json())
      .then(data => {
        if (data.paymentUrl) {
          // Redirigir al usuario a la URL de pago de PayU
          window.location.href = data.paymentUrl;
        } else {
          console.error('Error generando URL de pago:', data);
          alert('No se pudo generar el link de pago, revisa la consola.');
        }
      })
      .catch(err => {
        console.error('Error en fetch /payments:', err);
        alert('Ocurrió un error llamando /payments.');
      });
  }
  