// Admin Dashboard logic management
document.addEventListener('DOMContentLoaded', () => {
  // 1. Session verification
  const token = localStorage.getItem('hmb_admin_token');
  if (!token) {
    window.location.href = 'index.html';
    return;
  }

  // Display Admin Username
  const adminUser = JSON.parse(localStorage.getItem('hmb_admin_user') || '{}');
  const adminDisplay = document.getElementById('admin-display-name');
  if (adminDisplay && adminUser.username) {
    adminDisplay.textContent = adminUser.username;
  }

  // 2. Tab Navigation
  const navItems = document.querySelectorAll('.nav-item');
  const tabContents = document.querySelectorAll('.tab-content');

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const targetTab = item.getAttribute('data-tab');

      navItems.forEach(nav => nav.classList.remove('active'));
      tabContents.forEach(tab => tab.classList.remove('active'));

      item.classList.add('active');
      const tabElement = document.getElementById(`${targetTab}-tab`);
      if (tabElement) tabElement.classList.add('active');

      // Refresh corresponding content
      if (targetTab === 'proposals') loadProposals();
      if (targetTab === 'employees') loadEmployees();
      if (targetTab === 'inquiries') loadInquiries();
      if (targetTab === 'registrations') loadRegistrations();
      if (targetTab === 'overview') loadOverview();
    });
  });

  // Logout button
  document.getElementById('logout-btn').addEventListener('click', () => {
    adminApi.logout();
  });

  // 3. Role-based Access Restricting and Tab Initialization
  if (adminUser.role === 'Matchmaker') {
    // Hide restricted sidebar tabs
    const restrictedTabs = ['overview', 'employees', 'inquiries', 'registrations'];
    restrictedTabs.forEach(tab => {
      const el = document.querySelector(`[data-tab="${tab}"]`);
      if (el) el.style.display = 'none';
    });

    // Deactivate overview and activate proposals
    navItems.forEach(nav => nav.classList.remove('active'));
    tabContents.forEach(tab => tab.classList.remove('active'));

    const propNavItem = document.querySelector('[data-tab="proposals"]');
    const propTabContent = document.getElementById('proposals-tab');
    if (propNavItem) propNavItem.classList.add('active');
    if (propTabContent) propTabContent.classList.add('active');

    // Force load proposals
    loadProposals();
  } else {
    // Default load overview for SuperAdmin
    loadOverview();
  }

  // 4. Proposals CRUD Handlers
  setupProposalsHandlers();

  // 5. Employees CRUD Handlers
  setupEmployeesHandlers();

  // 6. Inquiries CRUD Handlers
  setupInquiriesHandlers();

  // 7. Registrations CRUD Handlers
  setupRegistrationsHandlers();
});

// --- Overview Dashboard stats ---
async function loadOverview() {
  try {
    const proposalsResp = await adminApi.getProposals();
    const employeesResp = await adminApi.getEmployees();
    const inquiriesResp = await adminApi.getInquiries();
    const registrationsResp = await adminApi.getRegistrations();

    document.getElementById('stat-total-proposals').textContent = proposalsResp.total || 0;
    document.getElementById('stat-total-employees').textContent = employeesResp.count || 0;
    document.getElementById('stat-total-inquiries').textContent = inquiriesResp.count || 0;
    document.getElementById('stat-total-registrations').textContent = registrationsResp.count || 0;
    
    // Recent list preview inside overview
    const recentGrid = document.getElementById('recent-activity-list');
    if (recentGrid) {
      const inquiries = inquiriesResp.data || [];
      recentGrid.innerHTML = inquiries.slice(0, 5).map(iq => `
        <div style="padding: 10px; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between;">
          <span><strong>${iq.fullName}</strong> (${iq.phone})</span>
          <span class="badge" style="background: ${iq.status === 'New' ? '#d9534f' : '#5cb85c'}; color: white; padding: 2px 6px; border-radius: 4px; font-size: 0.75rem;">${iq.status}</span>
        </div>
      `).join('') || '<p style="color: var(--light-text);">No recent activities</p>';
    }
  } catch (error) {
    console.error('Error loading overview statistics:', error.message);
  }
}

// --- Proposals CRUD Operations ---
let currentEditingProposalId = null;

function setupProposalsHandlers() {
  const openModalBtn = document.getElementById('btn-add-proposal');
  const modal = document.getElementById('proposal-modal');
  const closeModalBtn = modal.querySelector('.modal-close');
  const proposalForm = document.getElementById('proposal-form');

  openModalBtn.addEventListener('click', () => {
    currentEditingProposalId = null;
    document.getElementById('proposal-modal-title').textContent = 'Add Match Proposal';
    proposalForm.reset();
    modal.classList.add('active');
    const modalContent = document.querySelector('#proposal-modal .modal-content');
    if (modalContent) modalContent.scrollTop = 0;
  });

  closeModalBtn.addEventListener('click', () => {
    modal.classList.remove('active');
  });

  proposalForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const submitBtn = proposalForm.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Saving...';

    // Build Form Data (Multer multipart/form-data support for images)
    const formData = new FormData();
    const idNum = document.getElementById('prop-id-num').value;
    formData.append('profileId', 'HMB' + idNum);
    formData.append('fullName', document.getElementById('prop-name').value);
    formData.append('gender', document.getElementById('prop-gender').value);
    formData.append('maritalStatus', document.getElementById('prop-status').value);
    formData.append('dob', document.getElementById('prop-dob').value);
    formData.append('education', document.getElementById('prop-education').value);
    formData.append('occupation', document.getElementById('prop-occupation').value);
    formData.append('height', document.getElementById('prop-height').value);
    formData.append('caste', document.getElementById('prop-caste').value);
    formData.append('religion', document.getElementById('prop-religion').value);
    formData.append('city', document.getElementById('prop-city').value);
    formData.append('state', document.getElementById('prop-state').value);
    formData.append('aboutMe', document.getElementById('prop-about').value);
    formData.append('showOnPublicWebsite', document.getElementById('prop-show-public').checked);
    formData.append('region', document.getElementById('prop-region').value);
    formData.append('category', document.getElementById('prop-category').value);

    // Nested object stringified so backend parses correctly
    const contactDetails = {
      phone: document.getElementById('prop-phone').value,
      email: document.getElementById('prop-email').value,
    };
    formData.append('contactDetails', JSON.stringify(contactDetails));

    const photoFile = document.getElementById('prop-photo').files[0];
    if (photoFile) {
      formData.append('photo', photoFile);
    }

    try {
      if (currentEditingProposalId) {
        await adminApi.updateProposal(currentEditingProposalId, formData);
        alert('Proposal updated successfully');
      } else {
        await adminApi.createProposal(formData);
        alert('Proposal created successfully');
      }
      modal.classList.remove('active');
      loadProposals();
      loadOverview();
    } catch (error) {
      alert(`Error saving proposal: ${error.message}`);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Save Proposal';
    }
  });
}

async function loadProposals() {
  const tbody = document.getElementById('proposals-table-body');
  tbody.innerHTML = '<tr><td colspan="10" style="text-align: center;">Loading proposals data...</td></tr>';

  try {
    const response = await adminApi.getProposals();
    const proposals = response.data || [];

    if (proposals.length === 0) {
      tbody.innerHTML = '<tr><td colspan="10" style="text-align: center; color: var(--light-text);">No proposals database matches found.</td></tr>';
      return;
    }

    tbody.innerHTML = '';
    proposals.forEach(p => {
      const birthYear = new Date(p.dob).getFullYear();
      const currentYear = new Date().getFullYear();
      const age = currentYear - birthYear;

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>${p.profileId}</strong></td>
        <td>${p.fullName}</td>
        <td>${p.gender}</td>
        <td>${age} yrs</td>
        <td>${p.region || '-'}</td>
        <td>${p.category || '-'}</td>
        <td>${p.city}</td>
        <td>${p.caste}</td>
        <td>${p.showOnPublicWebsite ? '<span style="color: #5cb85c; font-weight:bold;">Public</span>' : '<span style="color: #d9534f; font-weight:bold;">Private</span>'}</td>
        <td>
          <button class="btn btn-primary" onclick="editProposal('${p._id}')" style="padding: 4px 10px; font-size: 0.8rem; margin-right: 5px;">Edit</button>
          <button class="btn btn-danger" onclick="deleteProposal('${p._id}')" style="padding: 4px 10px; font-size: 0.8rem;">Delete</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (error) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: red;">Error: ${error.message}</td></tr>`;
  }
}

async function editProposal(id) {
  try {
    const resObj = await adminApi.getProposal(id);
    const p = resObj.data;

    currentEditingProposalId = p._id;
    document.getElementById('proposal-modal-title').textContent = 'Edit Match Proposal';
    
    if (p.profileId) {
      document.getElementById('prop-id-num').value = p.profileId.replace('HMB', '');
    }
    
    document.getElementById('prop-name').value = p.fullName;
    document.getElementById('prop-gender').value = p.gender;
    document.getElementById('prop-status').value = p.maritalStatus;
    
    // Format date string for standard date inputs (YYYY-MM-DD)
    if (p.dob) {
      document.getElementById('prop-dob').value = new Date(p.dob).toISOString().split('T')[0];
    }
    
    document.getElementById('prop-education').value = p.education;
    document.getElementById('prop-occupation').value = p.occupation || '';
    document.getElementById('prop-height').value = p.height || '';
    document.getElementById('prop-caste').value = p.caste;
    document.getElementById('prop-religion').value = p.religion;
    document.getElementById('prop-city').value = p.city;
    document.getElementById('prop-state').value = p.state || '';
    document.getElementById('prop-about').value = p.aboutMe || '';
    document.getElementById('prop-show-public').checked = p.showOnPublicWebsite || false;
    document.getElementById('prop-region').value = p.region || '';
    document.getElementById('prop-category').value = p.category || '';

    if (p.contactDetails) {
      document.getElementById('prop-phone').value = p.contactDetails.phone || '';
      document.getElementById('prop-email').value = p.contactDetails.email || '';
    }

    document.getElementById('proposal-modal').classList.add('active');
    const modalContent = document.querySelector('#proposal-modal .modal-content');
    if (modalContent) modalContent.scrollTop = 0;
  } catch (error) {
    alert(`Failed to load details: ${error.message}`);
  }
}

async function deleteProposal(id) {
  if (confirm('Are you absolutely sure you want to delete this proposal profile? This action is irreversible.')) {
    try {
      await adminApi.deleteProposal(id);
      loadProposals();
      loadOverview();
    } catch (error) {
      alert(error.message);
    }
  }
}


// --- Employees CRUD Operations ---
let currentEditingEmployeeId = null;

function setupEmployeesHandlers() {
  const openModalBtn = document.getElementById('btn-add-employee');
  const modal = document.getElementById('employee-modal');
  const closeModalBtn = modal.querySelector('.modal-close');
  const employeeForm = document.getElementById('employee-form');

  openModalBtn.addEventListener('click', () => {
    currentEditingEmployeeId = null;
    document.getElementById('employee-modal-title').textContent = 'Add Employee';
    employeeForm.reset();
    modal.classList.add('active');
  });

  closeModalBtn.addEventListener('click', () => {
    modal.classList.remove('active');
  });

  employeeForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const submitBtn = employeeForm.querySelector('button[type="submit"]');
    submitBtn.disabled = true;

    const username = document.getElementById('emp-username').value;
    const password = document.getElementById('emp-password').value;

    if (!currentEditingEmployeeId && !password) {
      alert('Password is required for new employees!');
      submitBtn.disabled = false;
      return;
    }

    const empData = {
      name: document.getElementById('emp-name').value,
      role: document.getElementById('emp-role').value,
      email: document.getElementById('emp-email').value,
      phone: document.getElementById('emp-phone').value,
      salary: parseFloat(document.getElementById('emp-salary').value) || 0,
      status: document.getElementById('emp-status').value,
      accessRole: document.getElementById('emp-access-role').value,
      username: username
    };

    if (password) {
      empData.password = password;
    }

    try {
      if (currentEditingEmployeeId) {
        await adminApi.updateEmployee(currentEditingEmployeeId, empData);
        alert('Employee record updated successfully');
      } else {
        await adminApi.createEmployee(empData);
        alert('Employee created successfully');
      }
      modal.classList.remove('active');
      loadEmployees();
      loadOverview();
    } catch (error) {
      alert(`Error saving employee: ${error.message}`);
    } finally {
      submitBtn.disabled = false;
    }
  });
}

async function loadEmployees() {
  const tbody = document.getElementById('employees-table-body');
  tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">Loading employee database...</td></tr>';

  try {
    const response = await adminApi.getEmployees();
    const employees = response.data || [];

    if (employees.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: var(--light-text);">No employees databank profiles found.</td></tr>';
      return;
    }

    tbody.innerHTML = '';
    employees.forEach(emp => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>${emp.employeeId}</strong></td>
        <td>${emp.name}</td>
        <td>${emp.role}</td>
        <td>${emp.email}</td>
        <td>${emp.phone || '-'}</td>
        <td>PKR ${emp.salary?.toLocaleString() || '0'}</td>
        <td>
          <button class="btn btn-primary" onclick="editEmployee('${emp._id}')" style="padding: 4px 10px; font-size: 0.8rem; margin-right: 5px;">Edit</button>
          <button class="btn btn-danger" onclick="deleteEmployee('${emp._id}')" style="padding: 4px 10px; font-size: 0.8rem;">Delete</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (error) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: red;">Error: ${error.message}</td></tr>`;
  }
}

async function editEmployee(id) {
  try {
    const resObj = await adminApi.getEmployees();
    const emp = resObj.data.find(e => e._id === id);

    if (!emp) return;

    currentEditingEmployeeId = emp._id;
    document.getElementById('employee-modal-title').textContent = 'Edit Employee Profile';
    
    document.getElementById('emp-name').value = emp.name;
    document.getElementById('emp-role').value = emp.role;
    document.getElementById('emp-email').value = emp.email;
    document.getElementById('emp-phone').value = emp.phone || '';
    document.getElementById('emp-salary').value = emp.salary || '';
    document.getElementById('emp-username').value = emp.username || '';
    document.getElementById('emp-password').value = '';
    document.getElementById('emp-status').value = emp.status;
    document.getElementById('emp-access-role').value = emp.accessRole || 'Employee';

    document.getElementById('employee-modal').classList.add('active');
  } catch (error) {
    alert(`Failed to load employee details: ${error.message}`);
  }
}

async function deleteEmployee(id) {
  if (confirm('Delete this employee record?')) {
    try {
      await adminApi.deleteEmployee(id);
      loadEmployees();
      loadOverview();
    } catch (error) {
      alert(error.message);
    }
  }
}


// --- Inquiries Operations ---
function setupInquiriesHandlers() {
  // Inquiries are view-only and change-status/delete only, no complex create form needed
}

async function loadInquiries() {
  const tbody = document.getElementById('inquiries-table-body');
  tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">Loading public inquiries...</td></tr>';

  try {
    const response = await adminApi.getInquiries();
    const inquiries = response.data || [];

    if (inquiries.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--light-text);">No contact forms have been submitted yet.</td></tr>';
      return;
    }

    tbody.innerHTML = '';
    inquiries.forEach(iq => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${new Date(iq.createdAt).toLocaleDateString()}</td>
        <td><strong>${iq.fullName}</strong></td>
        <td>${iq.phone} / ${iq.email}</td>
        <td><em>${iq.message}</em></td>
        <td>
          <select onchange="updateInquiryStatus('${iq._id}', this.value)" style="padding: 4px; border-radius: 4px; font-size: 0.8rem;">
            <option value="New" ${iq.status === 'New' ? 'selected' : ''}>New</option>
            <option value="Reviewed" ${iq.status === 'Reviewed' ? 'selected' : ''}>Reviewed</option>
            <option value="Resolved" ${iq.status === 'Resolved' ? 'selected' : ''}>Resolved</option>
          </select>
        </td>
        <td>
          <button class="btn btn-danger" onclick="deleteInquiry('${iq._id}')" style="padding: 4px 10px; font-size: 0.8rem;">Delete</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } catch (error) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: red;">Error: ${error.message}</td></tr>`;
  }
}

async function updateInquiryStatus(id, newStatus) {
  try {
    await adminApi.updateInquiryStatus(id, newStatus);
    alert('Inquiry status updated');
    loadInquiries();
    loadOverview();
  } catch (error) {
    alert(error.message);
  }
}

async function deleteInquiry(id) {
  if (confirm('Delete this inquiry submission log?')) {
    try {
      await adminApi.deleteInquiry(id);
      loadInquiries();
      loadOverview();
    } catch (error) {
      alert(error.message);
    }
  }
}

// Global mappings so onclick attributes on HTML rows work
window.editProposal = editProposal;
window.deleteProposal = deleteProposal;
window.editEmployee = editEmployee;
window.deleteEmployee = deleteEmployee;
window.updateInquiryStatus = updateInquiryStatus;
window.deleteInquiry = deleteInquiry;

// --- Registrations CRUD Operations ---
async function loadRegistrations() {
  const tbody = document.getElementById('registrations-table-body');
  if (!tbody) return;

  tbody.innerHTML = '<tr><td colspan="8" style="text-align: center;">Loading registrations...</td></tr>';

  try {
    const response = await adminApi.getRegistrations();
    const registrations = response.data || [];

    if (registrations.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; color: var(--light-text);">No registrations submitted yet.</td></tr>';
      return;
    }

    tbody.innerHTML = registrations.map(reg => {
      const dateFormatted = reg.createdAt ? new Date(reg.createdAt).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric'
      }) : '-';
      const birthFormatted = reg.dob ? new Date(reg.dob).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric'
      }) : '-';
      const photoHtml = reg.photoUrl 
        ? `<img src="${reg.photoUrl}" style="width: 44px; height: 44px; border-radius: 50%; object-fit: cover; border: 1px solid var(--accent-color);">`
        : '<span style="font-size: 0.8rem; color: var(--light-text);">No photo</span>';

      const statusBadgeColor = reg.status === 'Converted' ? '#5cb85c' : '#f0ad4e';

      const actionButtons = reg.status === 'Pending'
        ? `<button class="btn" style="background-color: var(--accent-color); color: #1A0000; padding: 4px 8px; font-size: 0.75rem; font-weight:700;" onclick="openConvertModal('${reg._id}')">Convert</button>
           <button class="btn btn-outline" style="border-color: #d9534f; color: #d9534f; padding: 4px 8px; font-size: 0.75rem;" onclick="deleteRegistration('${reg._id}')">Delete</button>`
        : `<button class="btn btn-outline" style="border-color: #d9534f; color: #d9534f; padding: 4px 8px; font-size: 0.75rem;" onclick="deleteRegistration('${reg._id}')">Delete</button>`;

      return `
        <tr>
          <td>${dateFormatted}</td>
          <td>${photoHtml}</td>
          <td><strong>${reg.fullName}</strong><br><span style="font-size: 0.8rem; color: var(--light-text);">${reg.phone}</span><br><span style="font-size: 0.8rem; color: var(--light-text);">${reg.email || '-'}</span></td>
          <td>
            <span style="font-size: 0.8rem; line-height:1.4; display:block;">
              Gender: ${reg.gender || '-'} (Prefers: ${reg.lookingFor || '-'})<br>
              DOB: ${birthFormatted}<br>
              Caste: ${reg.caste || '-'} | Status: ${reg.maritalStatus || '-'}<br>
              Edu: ${reg.education || '-'} | Prof: ${reg.profession || '-'}
            </span>
          </td>
          <td><strong>${reg.region || '-'}</strong><br><span style="font-size: 0.8rem; color: var(--light-text);">${reg.city || '-'}</span></td>
          <td><div style="max-width: 200px; max-height: 80px; overflow-y: auto; font-size: 0.8rem; text-align: left; line-height:1.3;">${reg.partnerPreferences || '-'}</div></td>
          <td><span class="badge" style="background: ${statusBadgeColor}; color: white; padding: 2px 6px; border-radius: 4px; font-size: 0.75rem;">${reg.status}</span></td>
          <td>
            <div style="display: flex; gap: 5px;">
              ${actionButtons}
            </div>
          </td>
        </tr>
      `;
    }).join('');
  } catch (error) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: red;">Error: ${error.message}</td></tr>`;
  }
}

function setupRegistrationsHandlers() {
  const modal = document.getElementById('convert-modal');
  const closeModalBtn = document.getElementById('convert-modal-close');
  const convertForm = document.getElementById('convert-form');

  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', () => {
      modal.classList.remove('active');
    });
  }

  if (convertForm) {
    convertForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = document.getElementById('convert-registration-id').value;
      const category = document.getElementById('convert-category').value;
      const showOnPublicWebsite = document.getElementById('convert-show-public').checked;

      const submitBtn = convertForm.querySelector('button[type="submit"]');
      submitBtn.textContent = 'Converting...';
      submitBtn.disabled = true;

      try {
        await adminApi.convertRegistration(id, { category, showOnPublicWebsite });
        alert('Registration successfully converted to match proposal profile!');
        modal.classList.remove('active');
        loadRegistrations();
        loadOverview();
      } catch (error) {
        alert('Error: ' + error.message);
      } finally {
        submitBtn.textContent = 'Confirm & Convert';
        submitBtn.disabled = false;
      }
    });
  }
}

function openConvertModal(id) {
  const modal = document.getElementById('convert-modal');
  document.getElementById('convert-registration-id').value = id;
  document.getElementById('convert-show-public').checked = false;
  modal.classList.add('active');
}

async function deleteRegistration(id) {
  if (confirm('Are you sure you want to dismiss/delete this user registration?')) {
    try {
      await adminApi.deleteRegistration(id);
      loadRegistrations();
      loadOverview();
    } catch (error) {
      alert('Error: ' + error.message);
    }
  }
}

// Global mappings
window.openConvertModal = openConvertModal;
window.deleteRegistration = deleteRegistration;
window.loadRegistrations = loadRegistrations;
window.setupRegistrationsHandlers = setupRegistrationsHandlers;
