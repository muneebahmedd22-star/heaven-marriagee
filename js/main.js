// Heaven Marriage Bureau Main Script

document.addEventListener('DOMContentLoaded', () => {
  // Mobile Hamburger Menu toggle
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');

  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      navLinks.classList.toggle('active');
    });
  }

  // Active Navigation link highlighter
  const currentPath = window.location.pathname;
  const navItems = document.querySelectorAll('.nav-links a');
  navItems.forEach(item => {
    if (currentPath.includes(item.getAttribute('href'))) {
      item.classList.add('active');
    } else if (currentPath.endsWith('/') && item.getAttribute('href') === 'index.html') {
      item.classList.add('active');
    }
  });

  // Setup search forms on landing page
  const searchForm = document.getElementById('hero-search-form');
  if (searchForm) {
    searchForm.addEventListener('submit', searchWithPreferences);
  }

  // Contact form submission logic
  const contactForm = document.getElementById('contact-us-form');
  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = 'Submitting...';
      submitBtn.disabled = true;

      const inquiryData = {
        fullName: document.getElementById('contact-name').value,
        email: document.getElementById('contact-email').value,
        phone: document.getElementById('contact-phone').value,
        subject: 'General Inquiry',
        message: 'Direct website inquiry form submission. Please follow up.'
      };

      try {
        await api.submitInquiry(inquiryData);
        alert('Thank you! Your inquiry has been submitted successfully. Our agent will contact you soon.');
        contactForm.reset();
      } catch (error) {
        alert(`Error: ${error.message || 'Something went wrong. Please try again.'}`);
      } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      }
    });
  }

  // Scroll reveal IntersectionObserver setup
  const scrollElements = document.querySelectorAll('.scroll-reveal');
  if ('IntersectionObserver' in window && scrollElements.length > 0) {
    const elementObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          elementObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.15
    });
    scrollElements.forEach(el => elementObserver.observe(el));
  } else {
    // Fallback if IntersectionObserver is not supported
    scrollElements.forEach(el => el.classList.add('active'));
  }

  // Theme Toggle Logic
  const themeToggleBtn = document.getElementById('theme-toggle');
  
  // Set theme on load
  const currentTheme = localStorage.getItem('theme');
  if (currentTheme === 'dark') {
    document.body.classList.add('dark-theme');
    if (themeToggleBtn) {
      themeToggleBtn.querySelector('.sun-icon').style.display = 'block';
      themeToggleBtn.querySelector('.moon-icon').style.display = 'none';
    }
  }

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      document.body.classList.toggle('dark-theme');
      
      const isDark = document.body.classList.contains('dark-theme');
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
      
      const sunIcon = themeToggleBtn.querySelector('.sun-icon');
      const moonIcon = themeToggleBtn.querySelector('.moon-icon');
      
      if (isDark) {
        sunIcon.style.display = 'block';
        moonIcon.style.display = 'none';
      } else {
        sunIcon.style.display = 'none';
        moonIcon.style.display = 'block';
      }
    });
  }

  // Check if we are on the landing page and load featured/trending proposals
  if (document.getElementById('trending-proposals-grid')) {
    loadFeaturedProposals();
  }
});

// Load featured proposals for homepage
async function loadFeaturedProposals() {
  const grid = document.getElementById('trending-proposals-grid');
  if (!grid) return;

  grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px 0;"><div class="gold-spinner"></div><p style="color: var(--light-text); font-size: 0.95rem; font-family: var(--font-headings); font-style: italic;">Curating handpicked matches for you...</p></div>';

  try {
    const response = await api.getProposals({ limit: 10 });
    const proposals = response.data || [];

    if (proposals.length === 0) {
      grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: var(--light-text);">No featured profiles found. Please check back later.</div>';
      return;
    }

    grid.innerHTML = ''; // Clear loading indicator

    proposals.forEach(p => {
      const birthYear = new Date(p.dob).getFullYear();
      const currentYear = new Date().getFullYear();
      const age = currentYear - birthYear;
      
      const card = document.createElement('div');
      card.className = 'clean-proposal-card';
      
      const dobFormatted = p.dob ? new Date(p.dob).toLocaleDateString('en-GB') : '-';
      const heightStr = p.gender === 'Male' ? `5' 8"` : `5' 4"`;
      
      card.innerHTML = `
        <div class="clean-card-id">ID: ${p.profileId}</div>
        <span class="clean-card-premium-badge">Premium</span>
        
        ${p.compatibilityScore !== null ? `
          <span style="position: absolute; top: 18px; left: 30px; background: rgba(123, 29, 29, 0.08); color: var(--primary-color); font-size: 0.75rem; font-weight: 700; padding: 4px 10px; border-radius: 12px; border: 1px solid rgba(123, 29, 29, 0.2);">
            Match: ${p.compatibilityScore}%
          </span>
        ` : ''}

        <div class="info-rows" style="margin-top: 10px;">
          <div class="info-row">
            <span class="row-icon">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </span>
            <span class="row-label">Gender:</span>
            <span class="row-value">${p.gender}</span>
          </div>
          <div class="info-row">
            <span class="row-icon">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
            </span>
            <span class="row-label">Marital Status:</span>
            <span class="row-value">${p.maritalStatus}</span>
          </div>
          <div class="info-row">
            <span class="row-icon">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
            </span>
            <span class="row-label">Country:</span>
            <span class="row-value">${p.country || 'Pakistan'}</span>
          </div>
          <div class="info-row">
            <span class="row-icon">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            </span>
            <span class="row-label">City:</span>
            <span class="row-value">${p.city}</span>
          </div>
          <div class="info-row">
            <span class="row-icon">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </span>
            <span class="row-label">Caste:</span>
            <span class="row-value">${p.caste}</span>
          </div>
          <div class="info-row">
            <span class="row-icon">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            </span>
            <span class="row-label">DOB:</span>
            <span class="row-value">${dobFormatted}</span>
          </div>
          <div class="info-row">
            <span class="row-icon">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="9" x2="19" y2="9"/><line x1="5" y1="15" x2="19" y2="15"/><line x1="9" y1="5" x2="9" y2="19"/><line x1="15" y1="5" x2="15" y2="19"/></svg>
            </span>
            <span class="row-label">Height:</span>
            <span class="row-value">${heightStr}</span>
          </div>
          <div class="info-row">
            <span class="row-icon">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"/></svg>
            </span>
            <span class="row-label">Education:</span>
            <span class="row-value">${p.education}</span>
          </div>
          <div class="info-row">
            <span class="row-icon">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="15" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
            </span>
            <span class="row-label">Profession:</span>
            <span class="row-value">${p.occupation || '-'}</span>
          </div>
        </div>

        <!-- For More Information -->
        <div class="more-info-section">
          <div class="more-info-title">For More Information</div>
          <div class="more-info-box">
            <span class="contact-person-name">Heaven Matchmaker</span>
            <a href="https://wa.me/923204048464?text=Assalam-o-Alaikum, I am inquiring about Profile ID ${p.profileId} on Heaven Marriage Bureau" target="_blank" class="whatsapp-contact-link">
              <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24" style="vertical-align: middle;">
                <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984a9.96 9.96 0 0 0 1.333 4.993L2 22l5.233-1.371a9.945 9.945 0 0 0 4.777 1.224h.005c5.505 0 9.99-4.478 9.99-9.985 0-2.67-1.037-5.178-2.92-7.062C17.162 2.922 14.654 2 12.012 2zm5.727 14.072c-.314.888-1.543 1.637-2.13 1.722-.529.076-1.222.137-3.52-.816-2.936-1.218-4.836-4.218-4.983-4.417-.147-.197-1.184-1.579-1.184-3.013 0-1.433.748-2.137 1.015-2.423.267-.285.586-.356.782-.356.197 0 .393.002.563.01.18.009.421-.07.659.502.247.595.842 2.062.915 2.211.072.148.12.321.02.522-.097.2-.147.324-.294.496-.147.172-.31.385-.441.517-.148.147-.302.308-.13.603.172.295.767 1.266 1.644 2.049.88.784 1.62 1.025 1.915 1.173.295.148.466.12.639-.08.172-.2.748-.871.947-1.17.2-.298.397-.248.663-.148.267.1.1.92 2.052 1.947c.2.1.332.148.482.397.149.248.149 1.432-.165 2.32z"/>
              </svg> Chat
            </a>
          </div>
        </div>
      `;
      
      grid.appendChild(card);
    });

    // Initialize the auto-scroller for trending profiles
    initializeTrendingSlider();

  } catch (error) {
    grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: red;">Error: ${error.message}</div>`;
  }
}

function initializeTrendingSlider() {
  const grid = document.getElementById('trending-proposals-grid');
  const prevBtn = document.getElementById('trending-prev');
  const nextBtn = document.getElementById('trending-next');
  if (!grid || !prevBtn || !nextBtn) return;

  const cardWidth = 350 + 30; // Card width + gap
  let currentScroll = 0;
  let autoScrollInterval;

  const startAutoScroll = () => {
    stopAutoScroll();
    autoScrollInterval = setInterval(() => {
      const maxScroll = grid.scrollWidth - grid.parentElement.clientWidth;
      if (maxScroll <= 0) return;
      
      if (currentScroll >= maxScroll) {
        currentScroll = 0;
      } else {
        currentScroll += cardWidth;
        if (currentScroll > maxScroll) currentScroll = maxScroll;
      }
      grid.style.transform = `translateX(-${currentScroll}px)`;
    }, 3500);
  };

  const stopAutoScroll = () => {
    clearInterval(autoScrollInterval);
  };

  nextBtn.addEventListener('click', () => {
    stopAutoScroll();
    const maxScroll = grid.scrollWidth - grid.parentElement.clientWidth;
    if (maxScroll <= 0) return;
    
    currentScroll += cardWidth;
    if (currentScroll > maxScroll) currentScroll = maxScroll;
    grid.style.transform = `translateX(-${currentScroll}px)`;
    startAutoScroll();
  });

  prevBtn.addEventListener('click', () => {
    stopAutoScroll();
    currentScroll -= cardWidth;
    if (currentScroll < 0) currentScroll = 0;
    grid.style.transform = `translateX(-${currentScroll}px)`;
    startAutoScroll();
  });

  // Pause on hover
  grid.addEventListener('mouseenter', stopAutoScroll);
  grid.addEventListener('mouseleave', startAutoScroll);

  // Initialize
  startAutoScroll();
}
