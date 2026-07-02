// Staff Proposals Data Bank Client Logic
document.addEventListener('DOMContentLoaded', () => {
  const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.protocol === 'file:'
    ? 'http://localhost:5000/api/v1'
    : 'https://heaven-marriagee.onrender.com/api/v1';

  const lockScreen = document.getElementById('lock-screen');
  const dbContent = document.getElementById('db-content');
  const lockForm = document.getElementById('db-lock-form');
  const passwordInput = document.getElementById('db-password');
  const lockError = document.getElementById('lock-error');
  const btnLock = document.getElementById('btn-lock-db');
  
  // Navigation Steps
  const step1 = document.getElementById('db-step-1');
  const step2 = document.getElementById('db-step-2');
  const step3 = document.getElementById('db-step-3');

  const btnSearch = document.getElementById('btn-db-search');
  const btnReset = document.getElementById('btn-db-reset');

  // Modal
  const detailModal = document.getElementById('detail-modal');
  const closeDetailBtn = document.getElementById('close-detail-modal');

  // Local state
  let selectedGender = '';
  let selectedRegion = '';
  let selectedCategory = '';
  let proposalsData = []; // Store fetched proposals

  // Verify Session on Load
  const token = sessionStorage.getItem('hmb_db_token');
  if (token) {
    lockScreen.classList.add('unlocked');
    dbContent.classList.add('active');
  }

  // Handle Unlock password submit
  if (lockForm) {
    lockForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      lockError.style.display = 'none';

      const username = document.getElementById('db-username').value;
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
            username: username,
            password: password
          })
        });

        const result = await response.json();

        if (response.ok && result.success && result.data.token) {
          sessionStorage.setItem('hmb_db_token', result.data.token);
          sessionStorage.setItem('hmb_db_user', JSON.stringify(result.data));
          
          lockScreen.classList.add('unlocked');
          dbContent.classList.add('active');
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

  // Navigation controller functions
  window.goToStep2 = (gender) => {
    selectedGender = gender;
    document.getElementById('selected-gender-title').textContent = `${gender} Profiles Matching Directory`;
    
    // Render Regions/Categories
    const regions = [
      { name: 'Lahore', type: 'region' },
      { name: 'Karachi', type: 'region' },
      { name: 'Islamabad/Rawalpindi', type: 'region' },
      { name: 'South Punjab', type: 'region' },
      { name: 'Punjab Other Cities', type: 'region' },
      { name: 'KPK', type: 'region' },
      { name: 'Kashmir', type: 'region' },
      { name: 'International', type: 'region' },
      { name: 'Doctor', type: 'category' },
      { name: 'Engineer', type: 'category' },
      { name: 'Other Educated', type: 'category' },
      { name: '2nd Marriage', type: 'category' }
    ];

    const grid = document.getElementById('regions-display-grid');
    grid.innerHTML = regions.map(r => `
      <div class="city-card" onclick="selectSubcategory('${r.name}', '${r.type}')">
        <h3>${r.name}</h3>
        <p>${r.type === 'region' ? 'Filter by Region' : 'Filter by Specialization'}</p>
      </div>
    `).join('');

    step1.style.display = 'none';
    step2.style.display = 'block';
  };

  window.backToStep1 = () => {
    step2.style.display = 'none';
    step1.style.display = 'block';
  };

  window.selectSubcategory = (name, type) => {
    if (type === 'region') {
      selectedRegion = name;
      selectedCategory = '';
    } else {
      selectedCategory = name;
      selectedRegion = '';
    }

    step2.style.display = 'none';
    step3.style.display = 'block';
    loadProposals();
  };

  window.backToStep2 = () => {
    step3.style.display = 'none';
    step2.style.display = 'block';
  };

  window.resetToGenderSelection = () => {
    selectedGender = '';
    selectedRegion = '';
    selectedCategory = '';
    step3.style.display = 'none';
    step2.style.display = 'none';
    step1.style.display = 'block';
  };

  // Bind Search Filters
  if (btnSearch) {
    btnSearch.addEventListener('click', loadProposals);
  }

  if (btnReset) {
    btnReset.addEventListener('click', () => {
      document.getElementById('db-filter-marital').value = '';
      document.getElementById('db-filter-city').value = '';
      document.getElementById('db-filter-caste').value = '';
      document.getElementById('db-filter-edu').value = '';
      loadProposals();
    });
  }

  // Load Proposals
  async function loadProposals() {
    const tbody = document.getElementById('db-table-body');
    if (!tbody) return;

    tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 30px;">Loading proposals database...</td></tr>';

    const token = sessionStorage.getItem('hmb_db_token');
    if (!token) return;

    // Build Filters
    const filters = { gender: selectedGender };
    if (selectedRegion) filters.region = selectedRegion;
    if (selectedCategory) filters.category = selectedCategory;

    const maritalStatus = document.getElementById('db-filter-marital').value;
    const city = document.getElementById('db-filter-city').value;
    const caste = document.getElementById('db-filter-caste').value;
    const education = document.getElementById('db-filter-edu').value;

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
        proposalsData = result.data || [];

        if (proposalsData.length === 0) {
          tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 30px; color: var(--accent-color);">No proposals match the current filter criteria.</td></tr>';
          return;
        }

        tbody.innerHTML = proposalsData.map((p, index) => {
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
                <strong>Marital:</strong> ${p.maritalStatus}
              </td>
              <td class="profile-details-text">
                <strong>Age:</strong> ${age} yrs (DOB: ${dateFormatted})<br>
                <strong>Height:</strong> ${p.height || '-'}<br>
                <strong>Education:</strong> ${p.education}<br>
                <strong>Profession:</strong> ${p.occupation || '-'}
              </td>
              <td class="profile-details-text">
                <strong>Region:</strong> ${p.region || '-'}<br>
                <strong>City:</strong> ${p.city}
              </td>
              <td>${visibilityBadge}</td>
              <td class="profile-details-text">
                <strong>Phone:</strong> ${contactPhone}<br>
                <strong>Email:</strong> ${contactEmail}
              </td>
              <td style="text-align: center;">
                <button class="btn btn-primary" onclick="openProfileModal(${index})" style="padding: 6px 14px; font-size: 0.8rem; border-radius: 4px;">View Card</button>
              </td>
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

  // Open candidate details modal function
  window.openProfileModal = (index) => {
    const p = proposalsData[index];
    if (!p) return;

    const birthYear = new Date(p.dob).getFullYear();
    const currentYear = new Date().getFullYear();
    const age = currentYear - birthYear;
    const dateFormatted = p.dob ? new Date(p.dob).toLocaleDateString('en-GB') : '-';

    document.getElementById('modal-title-id').textContent = `Candidate Card: ${p.profileId}`;

    const photoHtml = p.photoUrl
      ? `<img src="${p.photoUrl}" alt="${p.fullName}">`
      : `<svg viewBox="0 0 24 24" width="80" height="80" fill="none" stroke="var(--accent-color)" stroke-width="1.5" style="margin: auto;">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
         </svg>`;

    const bodyContent = `
      <div class="modal-profile-header">
        <div class="modal-avatar-frame">
          ${photoHtml}
        </div>
        <div style="display: flex; flex-direction: column; justify-content: center;">
          <h3 style="font-size: 1.8rem; margin: 0 0 5px 0; color: var(--accent-color); font-family: 'Cinzel', serif;">${p.fullName}</h3>
          <span style="font-size: 0.9rem; opacity: 0.7;">${p.gender} &bull; ${p.caste} &bull; ${p.maritalStatus}</span>
          <div style="margin-top: 15px;">
            ${p.showOnPublicWebsite 
              ? '<span class="badge-status badge-public">Website Public</span>' 
              : '<span class="badge-status badge-private">Strictly Private (Internal Only)</span>'}
          </div>
        </div>
      </div>

      <div class="modal-details-grid">
        <div class="modal-grid-item"><strong>Age / Date of Birth:</strong> ${age} yrs (${dateFormatted})</div>
        <div class="modal-grid-item"><strong>Height:</strong> ${p.height || '-'}</div>
        <div class="modal-grid-item"><strong>Education Level:</strong> ${p.education}</div>
        <div class="modal-grid-item"><strong>Profession/Job:</strong> ${p.occupation || '-'}</div>
        <div class="modal-grid-item"><strong>Religion:</strong> ${p.religion || 'Islam'}</div>
        <div class="modal-grid-item"><strong>City & State:</strong> ${p.city}, ${p.state || '-'}</div>
        <div class="modal-grid-item"><strong>Region:</strong> ${p.region || '-'}</div>
        <div class="modal-grid-item"><strong>Registered Phone:</strong> <span style="font-weight: 700; color: var(--white);">${p.contactDetails?.phone || '-'}</span></div>
        <div class="modal-grid-item"><strong>Registered Email:</strong> ${p.contactDetails?.email || '-'}</div>
      </div>

      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid var(--gray-border);">
        <h4 style="color: var(--accent-color); margin: 0 0 10px 0; font-family: 'Cinzel', serif;">Self Description & Partner Preferences</h4>
        <p style="font-size: 0.95rem; line-height: 1.6; color: var(--white); opacity: 0.85; white-space: pre-line; background: rgba(0,0,0,0.2); padding: 15px; border-radius: 4px; border-left: 2.5px solid var(--accent-color);">${p.aboutMe || 'No description provided.'}</p>
      </div>
    `;

    document.getElementById('modal-body-content').innerHTML = bodyContent;
    detailModal.classList.add('active');
  };

  // Close Modal
  if (closeDetailBtn) {
    closeDetailBtn.addEventListener('click', () => {
      detailModal.classList.remove('active');
    });
  }

  // Close Modal on clicking background
  window.addEventListener('click', (e) => {
    if (e.target === detailModal) {
      detailModal.classList.remove('active');
    }
  });
});
