const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const ExifParser = require('exif-parser');
const sharp = require('sharp');
const {
  isInIndiaBounds,
  calculateMetadataConfidence,
  calculateSuspicionScore,
  getSuspicionExplanation,
  getRecommendation,
  calculateConfidence,
} = require('../utils/validation');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Main photo validation endpoint
router.post('/validate-photo', async (req, res) => {
  try {
    const { imageBase64, description, title } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'Image base64 is required' });
    }

    // Run parallel validations
    const [contentMatch, authenticityCheck, metadataValidation, issueClassification] =
      await Promise.all([
        validateContentMatch(imageBase64, description, title),
        detectManipulation(imageBase64),
        validateMetadata(imageBase64),
        classifyIssueType(imageBase64),
      ]);

    // Calculate overall confidence score
    const validationResult = calculateConfidence({
      contentMatch,
      authenticityCheck,
      metadataValidation,
      issueClassification,
    });

    res.json(validationResult);
  } catch (error) {
    console.error('Photo validation error:', error);
    res.status(500).json({
      error: 'Validation failed',
      message: error.message,
    });
  }
});

// Helper function to extract base64 data and mime type
function getBase64Data(imageBase64) {
  const matches = imageBase64.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,/);
  const mimeType = matches ? matches[1] : 'image/jpeg';
  const data = imageBase64
    .replace(/^data:image\/\w+;base64,/, '')
    .replace(/^data:[a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+;base64,/, '');
  return { mimeType, data };
}

/**
 * 1. Content Match Validation using Gemini Vision
 */
async function validateContentMatch(imageBase64, description, title) {
  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: { responseMimeType: 'application/json' },
    });

    const prompt = `You are a civic issue verification expert. Analyze this image and determine if it matches the reported issue.

**Report Title:** ${title || 'Not provided'}
**Report Description:** ${description || 'Not provided'}

**Your Task:**
1. Describe what you see in the image in detail
2. Determine if the image content matches the reported civic issue
3. Identify any inconsistencies or red flags
4. Rate the match confidence from 0-100

**Response Format (JSON only):**
{
  "imageDescription": "detailed description of what you see",
  "matchConfidence": 85,
  "reasoning": "why it matches or doesn't match",
  "inconsistencies": ["list any red flags"],
  "suggestedCategory": "pothole|streetlight|garbage|drainage|other"
}`;

    const { mimeType, data } = getBase64Data(imageBase64);
    const imagePart = {
      inlineData: {
        data,
        mimeType,
      },
    };

    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text().trim();

    const analysis = JSON.parse(text);

    return {
      passed: (analysis.matchConfidence || 0) >= 60, // 60% threshold
      confidence: analysis.matchConfidence || 0,
      details: analysis,
      warnings: analysis.inconsistencies || [],
    };
  } catch (error) {
    console.error('Content match validation error:', error);
    return {
      passed: true, // Fail open - don't block if AI fails
      confidence: 50,
      details: { error: error.message },
      warnings: ['AI content validation unavailable'],
    };
  }
}

/**
 * 2. Deepfake/Manipulation Detection
 */
async function detectManipulation(imageBase64) {
  try {
    const { data } = getBase64Data(imageBase64);
    const imageBuffer = Buffer.from(data, 'base64');

    // Use sharp to get image statistics
    const stats = await sharp(imageBuffer).stats();

    // Check for common manipulation indicators
    const checks = {
      // 1. Compression artifacts analysis
      compressionArtifacts: await analyzeCompressionArtifacts(imageBuffer),

      // 2. Color histogram analysis
      colorHistogram: await analyzeColorHistogram(stats),

      // 3. Noise pattern analysis
      noisePattern: await analyzeNoisePattern(imageBuffer),

      // 4. Edge detection
      edgePattern: await analyzeEdgePattern(imageBuffer),
    };

    // Simple heuristic scoring (replace with trained model for production)
    const suspicionScore = calculateSuspicionScore(checks);

    return {
      passed: suspicionScore < 30, // Less than 30% suspicious
      confidence: 100 - suspicionScore,
      details: {
        suspicionScore,
        checks,
        explanation: getSuspicionExplanation(suspicionScore, checks),
      },
      warnings: suspicionScore > 30 ? ['Possible image manipulation detected'] : [],
    };
  } catch (error) {
    console.error('Manipulation detection error:', error);
    return {
      passed: true,
      confidence: 50,
      details: { error: error.message },
      warnings: ['Manipulation check unavailable'],
    };
  }
}

/**
 * 3. EXIF Metadata Validation
 */
async function validateMetadata(imageBase64) {
  try {
    const { data } = getBase64Data(imageBase64);
    const imageBuffer = Buffer.from(data, 'base64');

    const parser = ExifParser.create(imageBuffer);
    const exifData = parser.parse();

    const checks = {
      hasExif: !!(exifData && exifData.tags),
      hasGPS: !!(exifData.tags?.GPSLatitude && exifData.tags?.GPSLongitude),
      hasCameraInfo: !!(exifData.tags?.Make || exifData.tags?.Model),
      hasTimestamp: !!exifData.tags?.DateTime,
      imageSize: exifData.imageSize,

      // Check if timestamp is reasonable (not future date)
      timestampValid: exifData.tags?.DateTime
        ? new Date(exifData.tags.DateTime * 1000) < new Date()
        : true,

      // Check if GPS coordinates are in India (if present)
      gpsInIndia: exifData.tags?.GPSLatitude
        ? isInIndiaBounds(exifData.tags.GPSLatitude, exifData.tags.GPSLongitude)
        : null,
    };

    // Photos from real phones typically have EXIF data
    // Absence might indicate screenshot or edited image
    const warningFlags = [];
    if (!checks.hasExif) warningFlags.push('No EXIF metadata found');
    if (!checks.hasCameraInfo) warningFlags.push('No camera information');
    if (checks.gpsInIndia === false) warningFlags.push('GPS location outside India');

    return {
      passed: true, // Don't reject based on metadata alone
      confidence: calculateMetadataConfidence(checks),
      details: {
        exifData: exifData.tags,
        checks,
      },
      warnings: warningFlags,
    };
  } catch (error) {
    // If not a JPEG (e.g. PNG), exif-parser throws.
    // That is expected, we default gracefully.
    return {
      passed: true,
      confidence: 40,
      details: { error: 'No readable EXIF data or non-JPEG format' },
      warnings: ['No EXIF metadata - might be PNG, screenshot or edited'],
    };
  }
}

/**
 * 4. Civic Issue Classification
 */
async function classifyIssueType(imageBase64) {
  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: { responseMimeType: 'application/json' },
    });

    const prompt = `Analyze this civic infrastructure image and classify the issue type.

**Possible Categories:**
- pothole: Road damage, potholes, broken pavement
- streetlight: Non-functional or damaged streetlights
- garbage: Waste accumulation, overflowing bins
- drainage: Blocked drains, water logging, sewage
- electrical: Exposed wires, damaged utility poles
- vandalism: Graffiti, property damage
- vegetation: Overgrown trees blocking roads/lights
- construction: Illegal construction, incomplete work
- other: Other civic issues

**Response (JSON only):**
{
  "primaryCategory": "category name",
  "confidence": 85,
  "reasoning": "why this category",
  "severity": "high|medium|low",
  "additionalCategories": ["if multiple issues visible"]
}`;

    const { mimeType, data } = getBase64Data(imageBase64);
    const imagePart = {
      inlineData: {
        data,
        mimeType,
      },
    };

    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text().trim();

    const classification = JSON.parse(text);

    return {
      passed: true,
      confidence: classification.confidence || 0,
      details: classification,
      warnings: [],
    };
  } catch (error) {
    console.error('Classification error:', error);
    return {
      passed: true,
      confidence: 50,
      details: { primaryCategory: 'other' },
      warnings: ['Auto-classification unavailable'],
    };
  }
}

// ==================== HELPER FUNCTIONS ====================

async function analyzeCompressionArtifacts(imageBuffer) {
  const metadata = await sharp(imageBuffer).metadata();
  return {
    format: metadata.format,
    quality: metadata.quality || 'unknown',
    hasArtifacts: metadata.format === 'jpeg',
  };
}

async function analyzeColorHistogram(stats) {
  const channels = stats.channels || [];
  const variance = channels.reduce((sum, ch) => sum + (ch.stdev || 0), 0) / (channels.length || 1);

  return {
    variance,
    isNatural: variance > 20,
  };
}

async function analyzeNoisePattern(imageBuffer) {
  try {
    const noiseImage = await sharp(imageBuffer)
      .greyscale()
      .convolve({
        width: 3,
        height: 3,
        kernel: [-1, -1, -1, -1, 8, -1, -1, -1, -1],
      })
      .stats();

    const stdev = noiseImage.channels[0].stdev;
    // Natural photos typically have some sensor noise. Very low noise suggests CGI or a solid image.
    // Extremely high noise could suggest artificial noise addition.
    return {
      hasNaturalNoise: stdev > 0.5 && stdev < 50,
      noiseLevel: stdev,
    };
  } catch (err) {
    return {
      hasNaturalNoise: true,
      noiseLevel: 5,
    };
  }
}

async function analyzeEdgePattern(imageBuffer) {
  try {
    const edgeImage = await sharp(imageBuffer)
      .greyscale()
      .convolve({
        width: 3,
        height: 3,
        kernel: [0, 1, 0, 1, -4, 1, 0, 1, 0],
      })
      .stats();

    const stdev = edgeImage.channels[0].stdev;
    // Natural photos have some variation in edge sharpness.
    return {
      hasNaturalEdges: stdev > 2 && stdev < 80,
      edgeComplexity: stdev,
    };
  } catch (err) {
    return {
      hasNaturalEdges: true,
      edgeComplexity: 15,
    };
  }
}

module.exports = router;
