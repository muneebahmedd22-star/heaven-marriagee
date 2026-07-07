const express = require('express');
const router = express.Router();
const Proposal = require('../models/Proposal');

// Local Fallback Matchmaker Parser (Zero Cost, No API Key required)
function localFallbackMatchmaker(queryText, proposals) {
  const text = queryText.toLowerCase();
  
  // Extract Gender Intent
  let gender = null;
  if (text.includes('larki') || text.includes('female') || text.includes('bride') || text.includes('dulhan') || text.includes('woman') || text.includes('girl')) {
    gender = 'Female';
  } else if (text.includes('larka') || text.includes('male') || text.includes('groom') || text.includes('dulha') || text.includes('man') || text.includes('boy')) {
    gender = 'Male';
  }

  // Extract City
  let city = null;
  const cities = ['lahore', 'karachi', 'islamabad', 'rawalpindi', 'multan', 'faisalabad', 'peshawar', 'gujranwala', 'sialkot'];
  for (const c of cities) {
    if (text.includes(c)) {
      city = c;
      break;
    }
  }

  // Extract Category/Profession
  let category = null;
  if (text.includes('doctor') || text.includes('mbbs')) {
    category = 'Doctor';
  } else if (text.includes('engineer') || text.includes('software') || text.includes('it ')) {
    category = 'Engineer';
  } else if (text.includes('second') || text.includes('2nd') || text.includes('divorced') || text.includes('widowed')) {
    category = '2nd Marriage';
  } else if (text.includes('late')) {
    category = 'Late Marriage';
  } else if (text.includes('tashi') || text.includes('shia')) {
    category = 'Ahle Tashi';
  }

  // Filter proposals
  let matches = proposals;
  if (gender) {
    matches = matches.filter(p => p.gender === gender);
  }
  if (city) {
    matches = matches.filter(p => p.city.toLowerCase().includes(city));
  }
  if (category) {
    matches = matches.filter(p => p.category === category);
  }

  // Detect script (Roman Urdu vs English)
  const isRomanUrdu = text.includes('chahye') || text.includes('larki') || text.includes('larka') || text.includes('rishta') || text.includes('chaheye') || text.includes('shadi') || text.includes('hai') || text.includes('sath') || text.includes('ko');

  if (matches.length === 0) {
    if (isRomanUrdu) {
      return "Assalam-o-Alaikum! Mujhe is waqt database mein aapke bataye criteria ke mutabiq koi public profile nahi mili. Lekin humare paas offline databank mein 5,000+ verified rishtay mojood hain. Please details ke liye WhatsApp button par click kar ke hamare consultant se raabta karein.";
    } else {
      return "Assalam-o-Alaikum! Currently, I couldn't find a matching public profile in our online list. However, we have 5,000+ private matches in our offline databank. Please click the WhatsApp button to connect directly with our matchmaker.";
    }
  }

  // Build profile list response
  const suggestions = matches.slice(0, 3).map(p => {
    const age = new Date().getFullYear() - new Date(p.dob).getFullYear();
    return `- **ID: ${p.profileId}** | ${p.gender} | Age: ${age} | Caste: ${p.caste} | City: ${p.city} | Education: ${p.education}`;
  }).join('\n');

  if (isRomanUrdu) {
    return `Assalam-o-Alaikum! Mujhe aapke criteria ke mutabiq yeh verified profiles mili hain:\n\n${suggestions}\n\nAap in profile IDs ke baray mein mazeed janne ke liye directly hamare matchmaker se WhatsApp par raabta kar sakte hain!`;
  } else {
    return `Assalam-o-Alaikum! I found the following verified matching profiles for your criteria:\n\n${suggestions}\n\nYou can inquire about these profile IDs directly with our matchmakers on WhatsApp!`;
  }
}

// @desc    Chat with AI Matchmaker
// @route   POST /api/v1/ai/chat
// @access  Public
router.post('/chat', async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ success: false, message: 'Please provide a message' });
  }

  try {
    // 1. Get all public proposals
    const proposals = await Proposal.find({ showOnPublicWebsite: true });

    // Format proposals for prompt
    const proposalsData = proposals.map(p => ({
      profileId: p.profileId,
      gender: p.gender,
      maritalStatus: p.maritalStatus,
      age: new Date().getFullYear() - new Date(p.dob).getFullYear(),
      caste: p.caste,
      religion: p.religion,
      city: p.city,
      education: p.education,
      category: p.category
    }));

    const apiKey = process.env.GEMINI_API_KEY;

    // 2. Call Gemini API if Key is present
    if (apiKey) {
      try {
        const systemPrompt = `You are the expert Matrimonial AI Assistant for Heaven Marriage Bureau. Your job is to help users find matches from the database. 
Here is the user query: "${message}"
Here are the available verified public proposals: ${JSON.stringify(proposalsData)}

Instructions:
1. Identify what matching criteria the user wants (Gender, Caste, Religion, City, Age, Profession).
2. Look through the proposals list and suggest 1 to 3 matching profiles by their ID.
3. Respond in the EXACT same language and script style the user used (if they write in Roman Urdu like 'shadi k liye shia doctor larki chahye lahore se', you MUST respond in warm, polite, natural Roman Urdu. If they write in English, respond in English).
4. Maintain an extremely respectful, helpful, and formal Islamic/Pakistani matrimonial tone.
5. If no profiles match, explain politely and advise them to click the WhatsApp button to check our 5,000+ offline private databank.
6. Keep the response concise, clear, and structured.`;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: systemPrompt }]
            }]
          })
        });

        const data = await response.json();
        
        if (response.ok && data.candidates && data.candidates[0].content.parts[0].text) {
          const aiReply = data.candidates[0].content.parts[0].text;
          return res.json({ success: true, reply: aiReply, mode: 'AI' });
        } else {
          console.warn('Gemini API returned error status, falling back to NLP parser.');
        }
      } catch (err) {
        console.error('Error calling Gemini API:', err.message);
      }
    }

    // 3. Fallback to Local Smart NLP parser if Gemini fails or Key is absent
    const fallbackReply = localFallbackMatchmaker(message, proposals);
    res.json({ success: true, reply: fallbackReply, mode: 'Fallback' });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
