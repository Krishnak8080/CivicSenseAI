const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { createClient } = require('@supabase/supabase-js');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || ''
);

router.post('/analyze-priority', async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required' });
    }

    const prompt = `You are an AI assistant for a civic reporting app.
    Given the following report from a citizen, determine the priority level of the issue.
    Respond ONLY with one of the following words: "high", "medium", or "low".

    Title: ${title}
    Description: ${description}`;

    const model = genAI.getGenerativeModel(
      { model: 'gemini-2.5-flash' },
      { customHeaders: { Referer: 'http://localhost:5173/' } }
    );
    const result = await model.generateContent(prompt);
    const priority = result.response.text().trim().toLowerCase();

    // Ensure the output is strictly one of the expected values
    const validPriorities = ['high', 'medium', 'low'];
    const finalPriority = validPriorities.includes(priority) ? priority : 'medium';

    res.json({ priority: finalPriority });
  } catch (error) {
    console.error('Error analyzing priority:', error);
    res.status(500).json({ error: 'Failed to analyze priority', details: error.message });
  }
});

router.post('/reports', async (req, res) => {
  try {
    const {
      title,
      description,
      photo_url,
      latitude,
      longitude,
      address,
      formatted_address,
      user_id,
      photo_validation,
    } = req.body;

    // Validate coordinates
    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Precise location coordinates required' });
    }

    // Validate coordinate ranges
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return res.status(400).json({ error: 'Invalid coordinates' });
    }

    // Get AI priority
    let ai_priority = 'medium';
    try {
      const prompt = `You are an AI assistant for a civic reporting app.
      Given the following report from a citizen, determine the priority level of the issue.
      Respond ONLY with one of the following words: "high", "medium", or "low".

      Title: ${title}
      Description: ${description}`;

      const model = genAI.getGenerativeModel(
        { model: 'gemini-2.5-flash' },
        { customHeaders: { Referer: 'http://localhost:5173/' } }
      );
      const result = await model.generateContent(prompt);
      const priorityStr = result.response.text().trim().toLowerCase();

      const validPriorities = ['high', 'medium', 'low'];
      if (validPriorities.includes(priorityStr)) {
        ai_priority = priorityStr;
      }
    } catch (aiError) {
      console.error('AI Priority Analysis Error:', aiError);
    }

    // Prepare photo validation fields
    let validationStatus = 'pending';
    let validationConfidence = null;
    let validationWarnings = [];
    let validationData = null;
    let requiresManualReview = false;

    if (photo_validation) {
      const statusMap = {
        VERIFIED: 'verified',
        FLAGGED_FOR_REVIEW: 'flagged',
        REJECTED: 'rejected',
        PENDING: 'pending',
      };
      validationStatus = statusMap[photo_validation.status] || 'pending';
      validationConfidence = photo_validation.overallConfidence;
      validationWarnings = photo_validation.warnings || [];
      validationData = photo_validation;
      requiresManualReview = photo_validation.recommendation?.requiresReview || false;
    }

    // Insert report with exact coordinates
    const { data, error } = await supabase
      .from('reports')
      .insert({
        title,
        description,
        image_url: photo_url,
        latitude: parseFloat(latitude), // Ensure precision
        longitude: parseFloat(longitude),
        location: address,
        formatted_address,
        priority: ai_priority,
        user_id,
        status: 'pending',
        votes_count: 0,
        photo_validation_status: validationStatus,
        photo_validation_confidence: validationConfidence,
        photo_validation_warnings: validationWarnings,
        photo_validation_data: validationData,
        requires_manual_review: requiresManualReview,
      })
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json(data);
  } catch (error) {
    console.error('Error creating report:', error);
    res.status(500).json({ error: 'Failed to create report', details: error.message });
  }
});

module.exports = router;
