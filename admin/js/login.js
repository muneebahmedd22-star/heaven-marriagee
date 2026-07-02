// Admin login interface controller

document.addEventListener('DOMContentLoaded', () => {
  // Check if already logged in, redirect to dashboard
  const token = localStorage.getItem('hmb_admin_token');
  if (token) {
    window.location.href = '/admin/dashboard.html';
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
        const userStr = localStorage.getItem('hmb_admin_user');
        if (userStr) {
          const user = JSON.parse(userStr);
          if (user.role === 'Employee') {
            localStorage.removeItem('hmb_admin_token');
            localStorage.removeItem('hmb_admin_user');
            throw new Error('Access Denied: Employees must use the Data Bank portal at /data-bank.');
          }
        }
        window.location.href = '/admin/dashboard.html';
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
