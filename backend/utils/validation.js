/**
 * Check if the coordinates lie within the approximate boundaries of India.
 *
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {boolean} True if coordinates are within India
 */
function isInIndiaBounds(lat, lon) {
  return lat >= 8.4 && lat <= 37.6 && lon >= 68.7 && lon <= 97.25;
}

/**
 * Calculates a confidence score based on the presence of EXIF metadata.
 *
 * @param {Object} checks - Object containing metadata checks
 * @returns {number} Metadata confidence score from 0-100
 */
function calculateMetadataConfidence(checks) {
  let score = 50; // Base score

  if (checks.hasExif) score += 15;
  if (checks.hasGPS) score += 10;
  if (checks.hasCameraInfo) score += 15;
  if (checks.hasTimestamp) score += 10;
  if (checks.timestampValid) score += 5;
  if (checks.gpsInIndia === true) score += 10;
  if (checks.gpsInIndia === false) score -= 25;

  return Math.min(Math.max(score, 0), 100);
}

/**
 * Calculates an image manipulation suspicion score.
 *
 * @param {Object} checks - Sharp image analysis results
 * @returns {number} Suspicion score from 0-100
 */
function calculateSuspicionScore(checks) {
  let score = 0;

  if (checks.compressionArtifacts.format === 'jpeg' && !checks.compressionArtifacts.hasArtifacts) {
    score += 20;
  }
  if (!checks.colorHistogram.isNatural) score += 25;
  if (!checks.noisePattern.hasNaturalNoise) score += 30;
  if (!checks.edgePattern.hasNaturalEdges) score += 25;

  return Math.min(score, 100);
}

/**
 * Returns a human-readable explanation of the manipulation suspicion score.
 *
 * @param {number} score - Suspicion score
 * @param {Object} checks - Checks object
 * @returns {string} Explanation text
 */
function getSuspicionExplanation(score, checks) {
  if (score < 30) return 'Image appears authentic';
  if (score < 60) return 'Some inconsistencies detected, possibly edited';
  return 'High probability of manipulation or AI generation';
}

/**
 * Generates user-friendly warnings and submission recommendations based on status.
 *
 * @param {string} status - VERIFIED | FLAGGED_FOR_REVIEW | REJECTED
 * @param {number} confidence - Confidence score
 * @param {string[]} warnings - Warnings array
 * @returns {Object} Recommendation object
 */
function getRecommendation(status, confidence, warnings) {
  if (status === 'REJECTED') {
    return {
      message: 'Photo validation failed',
      userMessage:
        'The uploaded photo does not appear to match the description or may be manipulated. Please upload a clear, recent photo of the actual civic issue.',
      allowSubmit: false,
    };
  }

  if (status === 'FLAGGED_FOR_REVIEW') {
    return {
      message: 'Photo flagged for manual review',
      userMessage: `Photo uploaded successfully, but requires review (${warnings.join(', ')}). Your report will be verified by our team.`,
      allowSubmit: true,
      requiresReview: true,
    };
  }

  return {
    message: 'Photo validated successfully',
    userMessage: 'Photo verified and authentic!',
    allowSubmit: true,
    requiresReview: false,
  };
}

/**
 * Combines all multi-layered validation outputs into a single overall confidence score and status.
 *
 * @param {Object} validations - Validation results
 * @returns {Object} Structured validation output
 */
function calculateConfidence(validations) {
  const { contentMatch, authenticityCheck, metadataValidation, issueClassification } = validations;

  // Weighted scoring
  const weights = {
    contentMatch: 0.5, // 50% - Most important
    authenticity: 0.3, // 30% - Critical for trust
    metadata: 0.1, // 10% - Supporting evidence
    classification: 0.1, // 10% - Supplementary info
  };

  const overallConfidence =
    contentMatch.confidence * weights.contentMatch +
    authenticityCheck.confidence * weights.authenticity +
    metadataValidation.confidence * weights.metadata +
    issueClassification.confidence * weights.classification;

  // Collect all warnings
  const allWarnings = [
    ...(contentMatch.warnings || []),
    ...(authenticityCheck.warnings || []),
    ...(metadataValidation.warnings || []),
    ...(issueClassification.warnings || []),
  ];

  // Determine validation status
  let status = 'VERIFIED';
  let action = 'accept';

  if (overallConfidence < 40) {
    status = 'REJECTED';
    action = 'reject';
  } else if (overallConfidence < 70 || allWarnings.length > 2) {
    status = 'FLAGGED_FOR_REVIEW';
    action = 'flag';
  }

  return {
    status,
    action,
    overallConfidence: Math.round(overallConfidence),
    validations: {
      contentMatch,
      authenticityCheck,
      metadataValidation,
      issueClassification,
    },
    warnings: allWarnings,
    recommendation: getRecommendation(status, overallConfidence, allWarnings),
  };
}

module.exports = {
  isInIndiaBounds,
  calculateMetadataConfidence,
  calculateSuspicionScore,
  getSuspicionExplanation,
  getRecommendation,
  calculateConfidence,
};
