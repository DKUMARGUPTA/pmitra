import express from 'express';
import auth from '../middleware/auth.js';
import { query } from '../db.js';

const DISEASE_KNOWLEDGE = {
  'newcastle': { symptoms: 'Green diarrhea, twisted neck, circular movement, breathing difficulty', treatment: 'Vitamin B complex, electrolytes, antibiotic (Enrofloxacin)', prevention: 'Vaccination (F/LaSota), biosecurity' },
  'infectious bronchitis': { symptoms: 'Coughing, sneezing, nasal discharge, kidney damage', treatment: 'No specific treatment. Supportive care.', prevention: 'Vaccination, good ventilation' },
  'coccidiosis': { symptoms: 'Bloody diarrhea, weight loss, pale comb, ruffled feathers', treatment: 'Amprolium (Coccidiostat)', prevention: 'Coccidiostats in feed' },
  'fowl cholera': { symptoms: 'Green/yellow diarrhea, swollen joints, sudden death', treatment: 'Antibiotics (Tetracycline)', prevention: 'Vaccination, rodent control' },
  'fowl pox': { symptoms: 'Warts on comb/wattles, diphtheritic membrane in mouth', treatment: 'No treatment. Remove scabs.', prevention: 'Wing-stick vaccination' },
  'mareks': { symptoms: 'Leg paralysis, tumor in organs, weight loss', treatment: 'No treatment. Culling.', prevention: 'Vaccination at day-old' },
  'ascites': { symptoms: 'Fluid in abdomen, blue comb, labored breathing', treatment: 'No cure. Improve ventilation.', prevention: 'Good ventilation, avoid cold' },
  'fatty liver': { symptoms: 'Fatty liver, bloody liver, sudden death in layers', treatment: 'Vitamin E, choline', prevention: 'Balanced diet' }
};

const router = express.Router();

// Chat with AI
router.post('/chat', auth, async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'Message required' });
    
    const lowerMessage = message.toLowerCase();
    let response = '';
    let type = 'general';
    
    // Disease detection
    for (const [disease, info] of Object.entries(DISEASE_KNOWLEDGE)) {
      if (lowerMessage.includes(disease) || lowerMessage.includes(info.symptoms.split(',')[0])) {
        response = `🦆 **${disease.toUpperCase()}**\n\n**Symptoms:** ${info.symptoms}\n\n**Treatment:** ${info.treatment}\n\n**Prevention:** ${info.prevention}`;
        type = 'disease';
        break;
      }
    }
    
    // Feed guidance
    if (!response) {
      if (lowerMessage.includes('feed') || lowerMessage.includes('fcr')) {
        response = '🐔 **Feed Guidance:**\n\n**Starter (Day 0-10):** 22-23% Protein\n**Grower (Day 11-24):** 20-21% Protein\n**Finisher (Day 25-35):** 18-19% Protein';
        type = 'feed';
      } else if (lowerMessage.includes('vaccin')) {
        response = '💉 **Vaccination Schedule:**\n\n**Day 1:** Marek\'s\n**Day 7:** IBD\n**Day 14:** Newcastle (F/LaSota)\n**Day 21:** IBD Booster\n**Day 28:** Newcastle + IBD';
        type = 'vaccine';
      } else if (lowerMessage.includes('mortality') || lowerMessage.includes('death')) {
        response = '⚠️ **Mortality Alerts:**\n\n• Normal: 0.5-1% per week\n• Warning: >2% per day\n• Critical: >5% per day\n\nCheck: Temperature, Water, Disease, Feed';
        type = 'alert';
      } else if (lowerMessage.includes('temperature') || lowerMessage.includes('temp')) {
        response = '🌡️ **Ideal Temperature:**\n\n**Day 1-7:** 32-35°C\n**Day 8-14:** 29-32°C\n**Day 15-21:** 26-29°C\n**Day 22-28:** 23-26°C\n**Day 29+:** 20-23°C';
        type = 'temperature';
      } else {
        response = '🤖 **PoultryMitra AI:**\n\nI can help with:\n• Disease symptoms & treatment\n• Feed & FCR guidance\n• Vaccination schedule\n• Mortality alerts\n• Temperature management\n\nAsk me anything!';
      }
    }
    
    // Save to chat history
    await query('INSERT INTO chat_history (user_id, message, response) VALUES (?, ?, ?)', [req.user.userId, message, response]);
    
    res.json({ response, type });
  } catch (error) {
    console.error('AI chat error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Placement guidance (核心功能!)
router.get('/placement', auth, async (req, res) => {
  try {
    const month = new Date().getMonth();
    
    const seasonalData = {
      10: { score: 9, reason: 'Winter - Best FCR, low mortality', fcr: '1.7-1.8' },
      11: { score: 9, reason: 'Winter - Best FCR, low mortality', fcr: '1.7-1.8' },
      0: { score: 9, reason: 'Winter - Best FCR, low mortality', fcr: '1.7-1.8' },
      1: { score: 9, reason: 'Winter - Best FCR, low mortality', fcr: '1.7-1.8' },
      2: { score: 7, reason: 'Spring - Good conditions', fcr: '1.8-1.85' },
      8: { score: 7, reason: 'Early autumn - Good conditions', fcr: '1.8-1.85' },
      3: { score: 5, reason: 'Variable - Watch temperature', fcr: '1.85-1.9' },
      7: { score: 5, reason: 'Monsoon start - Manage humidity', fcr: '1.85-1.9' },
      4: { score: 2, reason: 'Summer heat stress - High mortality risk', fcr: '1.9-2.0' },
      5: { score: 2, reason: 'Summer heat stress - High mortality risk', fcr: '1.9-2.0' },
      6: { score: 4, reason: 'Monsoon - Disease risk, humidity issues', fcr: '1.9-1.95' }
    };
    
    const data = seasonalData[month];
    const upcomingFestivals = [];
    if ([8, 9, 10].includes(month)) {
      upcomingFestivals.push('Diwali - Expected price spike (+₹15-20/kg)');
    }
    if (month === 2 || month === 3) {
      upcomingFestivals.push('Eid - Expected price spike (+₹10-15/kg)');
    }
    
    res.json({
      currentMonth: month + 1,
      recommendation: data.score >= 7 ? 'GOOD' : data.score >= 4 ? 'MODERATE' : 'AVOID',
      score: data.score,
      reason: data.reason,
      expectedFCR: data.fcr,
      festivals: upcomingFestivals,
      guidance: data.score >= 7 ? '✅ Good time for placement.' : data.score >= 4 ? '⚠️ Proceed with caution.' : '❌ Not recommended.'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get chat history
router.get('/history', auth, async (req, res) => {
  try {
    const history = await query('SELECT * FROM chat_history WHERE user_id = ? ORDER BY created_at DESC LIMIT 50', [req.user.userId]);
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;