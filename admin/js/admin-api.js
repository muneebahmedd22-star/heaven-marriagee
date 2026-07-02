// Heaven Marriage Bureau Admin API Client
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.protocol === 'file:'
  ? 'http://localhost:5000/api/v1'
  : 'https://heaven-marriagee.onrender.com/api/v1';

const adminApi = {
  // Helper to fetch authorization header
  getHeaders(isMultipart = false) {
    const token = localStorage.getItem('hmb_admin_token');
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    if (!isMultipart) {
      headers['Content-Type'] = 'application/json';
    }
    return headers;
  },

  // Handle API responses and catch 401s
  async handleResponse(response) {
    if (response.status === 401) {
      localStorage.removeItem('hmb_admin_token');
      localStorage.removeItem('hmb_admin_user');
      const currentPath = window.location.pathname;
      if (!currentPath.endsWith('index.html') && !currentPath.endsWith('/admin') && !currentPath.endsWith('/admin/')) {
        window.location.href = 'index.html'; // Redirect to login page
      }
      throw new Error('Invalid credentials or session expired.');
    }
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }
    return data;
  },

  // Auth Operations
  async login(username, password) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });
    const data = await this.handleResponse(response);
    if (data.success && data.data.token) {
      localStorage.setItem('hmb_admin_token', data.data.token);
      localStorage.setItem('hmb_admin_user', JSON.stringify(data.data));
    }
    return data;
  },

  logout() {
    localStorage.removeItem('hmb_admin_token');
    localStorage.removeItem('hmb_admin_user');
    window.location.href = 'index.html';
  },

  // CRUD Proposals
  async getProposals(filters = {}) {
    const queryParams = new URLSearchParams(filters);
    const response = await fetch(`${API_BASE_URL}/proposals/admin?${queryParams.toString()}`, {
      headers: this.getHeaders()
    });
    return this.handleResponse(response);
  },

  async getProposal(id) {
    const response = await fetch(`${API_BASE_URL}/proposals/${id}`, {
      headers: this.getHeaders()
    });
    return this.handleResponse(response);
  },

  async createProposal(formData) {
    // Note: formData should be a FormData object (for Multer multipart uploads)
    const response = await fetch(`${API_BASE_URL}/proposals`, {
      method: 'POST',
      headers: this.getHeaders(true), // isMultipart = true
      body: formData
    });
    return this.handleResponse(response);
  },

  async updateProposal(id, formData) {
    const response = await fetch(`${API_BASE_URL}/proposals/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(true), // isMultipart = true
      body: formData
    });
    return this.handleResponse(response);
  },

  async deleteProposal(id) {
    const response = await fetch(`${API_BASE_URL}/proposals/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });
    return this.handleResponse(response);
  },

  // CRUD Employees
  async getEmployees() {
    const response = await fetch(`${API_BASE_URL}/employees`, {
      headers: this.getHeaders()
    });
    return this.handleResponse(response);
  },

  async createEmployee(employeeData) {
    const response = await fetch(`${API_BASE_URL}/employees`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(employeeData)
    });
    return this.handleResponse(response);
  },

  async updateEmployee(id, employeeData) {
    const response = await fetch(`${API_BASE_URL}/employees/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(employeeData)
    });
    return this.handleResponse(response);
  },

  async deleteEmployee(id) {
    const response = await fetch(`${API_BASE_URL}/employees/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });
    return this.handleResponse(response);
  },

  // CRUD Inquiries
  async getInquiries() {
    const response = await fetch(`${API_BASE_URL}/inquiries`, {
      headers: this.getHeaders()
    });
    return this.handleResponse(response);
  },

  async updateInquiryStatus(id, status) {
    const response = await fetch(`${API_BASE_URL}/inquiries/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify({ status })
    });
    return this.handleResponse(response);
  },

  async deleteInquiry(id) {
    const response = await fetch(`${API_BASE_URL}/inquiries/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });
    return this.handleResponse(response);
  },

  // CRUD Registrations
  async getRegistrations() {
    const response = await fetch(`${API_BASE_URL}/registrations`, {
      headers: this.getHeaders()
    });
    return this.handleResponse(response);
  },

  async convertRegistration(id, conversionData) {
    const response = await fetch(`${API_BASE_URL}/registrations/${id}/convert`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(conversionData)
    });
    return this.handleResponse(response);
  },

  async deleteRegistration(id) {
    const response = await fetch(`${API_BASE_URL}/registrations/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });
    return this.handleResponse(response);
  }
};
