// Staff Proposals Data Bank Client Logic
document.addEventListener('DOMContentLoaded', () => {
  // Production API Base URL resolving
  const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.protocol === 'file:'
    ? 'http://localhost:5000/api/v1'
    : 'https://heaven-marriagee.onrender.com/api/v1';

  const lockScreen = document.getElementById('lock-screen');
  const dbContent = document.getElementById('db-content');
  const lockForm = document.getElementById('db-lock-form');
  const passwordInput = document.getElementById('db-password');
  const lockError = document.getElementById('lock-error');
  const btnLock = document.getElementById('btn-lock-db');
  
  const btnSearch = document.getElementById('btn-db-search');
  const btnReset = document.getElementById('btn-db-reset');

  // Verify Session on Load
  const token = sessionStorage.getItem('hmb_db_token');
  if (token) {
    lockScreen.classList.add('unlocked');
    dbContent.classList.add('active');
    loadProposals();
  }

  // Handle Unlock password submit
  if (lockForm) {
    lockForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      lockError.style.display = 'none';

      const password = passwordInput.value;
      const submitBtn = document.getElementById('btn-unlock');
      submitBtn.textContent = 'Verifying...';
      submitBtn.disabled = true;

      try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            username: 'staff',
            password: password
          })
        });

        const result = await response.json();

        if (response.ok && result.success && result.data.token) {
          sessionStorage.setItem('hmb_db_token', result.data.token);
          sessionStorage.setItem('hmb_db_user', JSON.stringify(result.data));
          
          lockScreen.classList.add('unlocked');
          dbContent.classList.add('active');
          loadProposals();
        } else {
          throw new Error(result.message || 'Incorrect password');
        }
      } catch (error) {
        lockError.textContent = error.message;
        lockError.style.display = 'block';
        submitBtn.textContent = 'Unlock Data Bank';
        submitBtn.disabled = false;
      }
    });
  }

  // Handle Lock Console Click
  if (btnLock) {
    btnLock.addEventListener('click', () => {
      sessionStorage.removeItem('hmb_db_token');
      sessionStorage.removeItem('hmb_db_user');
      window.location.reload();
    });
  }

  // Bind Search Filters
  if (btnSearch) {
    btnSearch.addEventListener('click', loadProposals);
  }

  if (btnReset) {
    btnReset.addEventListener('click', () => {
      document.getElementById('db-filter-gender').value = '';
      document.getElementById('db-filter-marital').value = '';
      document.getElementById('db-filter-city').value = '';
      document.getElementById('db-filter-caste').value = '';
      document.getElementById('db-filter-edu').value = '';
      loadProposals();
    });
  }

  // Load Proposals function
  async function loadProposals() {
    const tbody = document.getElementById('db-table-body');
    if (!tbody) return;

    tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 30px;">Loading proposals database...</td></tr>';

    const token = sessionStorage.getItem('hmb_db_token');
    if (!token) return;

    // Build Filters
    const filters = {};
    const gender = document.getElementById('db-filter-gender').value;
    const maritalStatus = document.getElementById('db-filter-marital').value;
    const city = document.getElementById('db-filter-city').value;
    const caste = document.getElementById('db-filter-caste').value;
    const education = document.getElementById('db-filter-edu').value;

    if (gender) filters.gender = gender;
    if (maritalStatus) filters.maritalStatus = maritalStatus;
    if (city) filters.city = city;
    if (caste) filters.caste = caste;
    if (education) filters.education = education;

    const queryParams = new URLSearchParams(filters);

    try {
      const response = await fetch(`${API_BASE_URL}/proposals/admin?${queryParams.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();

      if (response.status === 401) {
        sessionStorage.removeItem('hmb_db_token');
        sessionStorage.removeItem('hmb_db_user');
        window.location.reload();
        return;
      }

      if (response.ok && result.success) {
        const proposals = result.data || [];

        if (proposals.length === 0) {
          tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 30px; color: var(--accent-color);">No proposals match the current filter criteria.</td></tr>';
          return;
        }

        tbody.innerHTML = proposals.map(p => {
          const birthYear = new Date(p.dob).getFullYear();
          const currentYear = new Date().getFullYear();
          const age = currentYear - birthYear;
          
          const dateFormatted = p.dob ? new Date(p.dob).toLocaleDateString('en-GB') : '-';
          const regDateFormatted = new Date(p.createdAt).toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric'
          });

          const photoHtml = p.photoUrl
            ? `<img src="${p.photoUrl}" class="db-photo">`
            : '<span style="color: rgba(255,255,255,0.4); font-size:0.8rem;">No photo</span>';

          const visibilityBadge = p.showOnPublicWebsite
            ? '<span class="badge-status badge-public">Public</span>'
            : '<span class="badge-status badge-private">Private</span>';

          const contactPhone = p.contactDetails?.phone || '-';
          const contactEmail = p.contactDetails?.email || '-';

          return `
            <tr>
              <td><strong style="color: var(--accent-color);">${p.profileId}</strong><br><span style="font-size: 0.75rem; color: rgba(255,255,255,0.4);">${regDateFormatted}</span></td>
              <td>${photoHtml}</td>
              <td class="profile-details-text">
                <strong>Name:</strong> ${p.fullName}<br>
                <strong>Gender:</strong> ${p.gender}<br>
                <strong>Caste:</strong> ${p.caste}<br>
                <strong>Marital Status:</strong> ${p.maritalStatus}
              </td>
              <td class="profile-details-text">
                <strong>Age:</strong> ${age} yrs (DOB: ${dateFormatted})<br>
                <strong>Education:</strong> ${p.education}<br>
                <strong>Profession:</strong> ${p.occupation || '-'}
              </td>
              <td class="profile-details-text">
                <strong>Region:</strong> ${p.region || '-'}<br>
                <strong>City:</strong> ${p.city}<br>
                <strong>Country:</strong> ${p.country || 'Pakistan'}
              </td>
              <td><div style="max-height: 80px; overflow-y: auto; text-align: left; font-size: 0.8rem; line-height: 1.4;">${p.aboutMe || '-'}</div></td>
              <td class="profile-details-text">
                <strong>Phone:</strong> ${contactPhone}<br>
                <strong>Email:</strong> ${contactEmail}
              </td>
              <td>${visibilityBadge}</td>
            </tr>
          `;
        }).join('');
      } else {
        throw new Error(result.message || 'Failed to fetch database records');
      }
    } catch (error) {
      tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; padding: 30px; color: red;">Error: ${error.message}</td></tr>`;
    }
  }
});
