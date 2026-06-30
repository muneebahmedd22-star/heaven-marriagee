// Admin login interface controller

document.addEventListener('DOMContentLoaded', () => {
  // Check if already logged in, redirect to dashboard
  const token = localStorage.getItem('hmb_admin_token');
  if (token) {
    window.location.href = 'dashboard.html';
  }

  const loginForm = document.getElementById('admin-login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const usernameInput = document.getElementById('username').value;
      const passwordInput = document.getElementById('password').value;
      const errorMsg = document.getElementById('error-message');
      const submitBtn = loginForm.querySelector('button[type="submit"]');

      errorMsg.style.display = 'none';
      submitBtn.textContent = 'Verifying...';
      submitBtn.disabled = true;

      try {
        await adminApi.login(usernameInput, passwordInput);
        window.location.href = 'dashboard.html';
      } catch (error) {
        errorMsg.textContent = error.message || 'Invalid username or password';
        errorMsg.style.display = 'block';
      } finally {
        submitBtn.textContent = 'Login';
        submitBtn.disabled = false;
      }
    });
  }
});
