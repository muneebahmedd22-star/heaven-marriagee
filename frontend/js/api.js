// Heaven Marriage Bureau API Helper
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.protocol === 'file:'
  ? 'http://localhost:5000/api/v1'
  : 'https://heaven-marriage-bureau-backend.onrender.com/api/v1'; // Production URL for backend

const api = {
  // Get proposals with optional filters/queries
  async getProposals(params = {}) {
    const queryParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        queryParams.append(key, params[key]);
      }
    });

    const url = `${API_BASE_URL}/proposals?${queryParams.toString()}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch proposals');
    }
    return response.json();
  },

  // Get a single proposal
  async getProposalById(id) {
    const response = await fetch(`${API_BASE_URL}/proposals/${id}`);
    if (!response.ok) {
      throw new Error('Proposal not found');
    }
    return response.json();
  },

  // Submit contact/inquiry form
  async submitInquiry(inquiryData) {
    const response = await fetch(`${API_BASE_URL}/inquiries`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(inquiryData),
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || 'Inquiry submission failed');
    }
    return response.json();
  }
};
