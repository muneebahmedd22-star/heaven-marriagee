// Frontend Compatibility Score utilities

// Calculate compatibility score on the client side if profile/preferences are provided
function calculateClientCompatibility(profile, preferences) {
  let score = 0;
  
  if (!preferences || !profile) return 0;
  
  // 1. Same City (30%)
  if (preferences.city && profile.city) {
    if (profile.city.trim().toLowerCase() === preferences.city.trim().toLowerCase()) {
      score += 30;
    }
  }

  // 2. Same Caste (25%)
  if (preferences.caste && profile.caste) {
    if (profile.caste.trim().toLowerCase() === preferences.caste.trim().toLowerCase()) {
      score += 25;
    }
  }

  // 3. Education Match (25%)
  if (preferences.education && profile.education) {
    if (profile.education.trim().toLowerCase() === preferences.education.trim().toLowerCase()) {
      score += 25;
    }
  }

  // 4. Age within 5 years of preference (20%)
  if (preferences.age && profile.dob) {
    const prefAge = parseInt(preferences.age);
    if (!isNaN(prefAge)) {
      const birthYear = new Date(profile.dob).getFullYear();
      const currentYear = new Date().getFullYear();
      const age = currentYear - birthYear;
      if (Math.abs(age - prefAge) <= 5) {
        score += 20;
      }
    }
  }

  return score;
}

// Redirect user to proposals page with query strings for filtering & calculating scores
function searchWithPreferences(event) {
  event.preventDefault();
  
  const gender = document.getElementById('search-gender')?.value || '';
  const maritalStatus = document.getElementById('search-status')?.value || '';
  const city = document.getElementById('search-city')?.value || '';
  const caste = document.getElementById('search-caste')?.value || '';
  const education = document.getElementById('search-education')?.value || '';
  const age = document.getElementById('search-age')?.value || '';

  const params = new URLSearchParams();
  if (gender) params.append('gender', gender === 'Male' ? 'Female' : 'Male'); // Target opposite gender by default
  if (maritalStatus) params.append('maritalStatus', maritalStatus);
  
  // Pass query params for matching
  if (city) {
    params.append('city', city);
    params.append('prefCity', city);
  }
  if (caste) {
    params.append('caste', caste);
    params.append('prefCaste', caste);
  }
  if (education) {
    params.append('education', education);
    params.append('prefEducation', education);
  }
  if (age) {
    params.append('prefAge', age);
  }

  window.location.href = `proposals.html?${params.toString()}`;
}
