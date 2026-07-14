const {
  isInIndiaBounds,
  calculateMetadataConfidence,
  calculateSuspicionScore,
  getRecommendation,
  calculateConfidence,
} = require('../utils/validation');

describe('Validation Helpers', () => {
  describe('isInIndiaBounds', () => {
    test('should return true for coordinates inside India', () => {
      // New Delhi
      expect(isInIndiaBounds(28.6139, 77.209)).toBe(true);
      // Mumbai
      expect(isInIndiaBounds(19.076, 72.8777)).toBe(true);
      // Bengaluru
      expect(isInIndiaBounds(12.9716, 77.5946)).toBe(true);
    });

    test('should return false for coordinates outside India', () => {
      // London
      expect(isInIndiaBounds(51.5074, -0.1278)).toBe(false);
      // New York
      expect(isInIndiaBounds(40.7128, -74.006)).toBe(false);
      // Tokyo
      expect(isInIndiaBounds(35.6762, 139.6503)).toBe(false);
    });

    test('should handle boundary conditions correctly', () => {
      expect(isInIndiaBounds(8.4, 68.7)).toBe(true);
      expect(isInIndiaBounds(37.6, 97.25)).toBe(true);
      expect(isInIndiaBounds(8.3, 68.7)).toBe(false);
      expect(isInIndiaBounds(37.7, 97.25)).toBe(false);
    });
  });

  describe('calculateMetadataConfidence', () => {
    test('should score 100 for perfect EXIF with GPS in India', () => {
      const checks = {
        hasExif: true,
        hasGPS: true,
        hasCameraInfo: true,
        hasTimestamp: true,
        timestampValid: true,
        gpsInIndia: true,
      };
      // Base (50) + Exif (15) + GPS (10) + Camera (15) + Timestamp (10) + ValidTime (5) + GPSIndia (10) = 115 capped at 100
      expect(calculateMetadataConfidence(checks)).toBe(100);
    });

    test('should penalize for GPS outside India', () => {
      const checks = {
        hasExif: true,
        hasGPS: true,
        hasCameraInfo: true,
        hasTimestamp: true,
        timestampValid: true,
        gpsInIndia: false,
      };
      // Base (50) + Exif (15) + GPS (10) + Camera (15) + Timestamp (10) + ValidTime (5) - GPSIndiaPenalty (25) = 80
      expect(calculateMetadataConfidence(checks)).toBe(80);
    });

    test('should handle missing EXIF data gracefully', () => {
      const checks = {
        hasExif: false,
        hasGPS: false,
        hasCameraInfo: false,
        hasTimestamp: false,
        timestampValid: true,
        gpsInIndia: null,
      };
      // Base (50) + ValidTime (5) = 55
      expect(calculateMetadataConfidence(checks)).toBe(55);
    });
  });

  describe('calculateSuspicionScore', () => {
    test('should return 0 suspicion score for perfect natural images', () => {
      const checks = {
        compressionArtifacts: { format: 'jpeg', hasArtifacts: true },
        colorHistogram: { isNatural: true },
        noisePattern: { hasNaturalNoise: true },
        edgePattern: { hasNaturalEdges: true },
      };
      expect(calculateSuspicionScore(checks)).toBe(0);
    });

    test('should accumulate suspicion for unnatural noise/edges/histogram', () => {
      const checks = {
        compressionArtifacts: { format: 'jpeg', hasArtifacts: false }, // +20
        colorHistogram: { isNatural: false }, // +25
        noisePattern: { hasNaturalNoise: false }, // +30
        edgePattern: { hasNaturalEdges: false }, // +25
      };
      // 20 + 25 + 30 + 25 = 100 suspicion
      expect(calculateSuspicionScore(checks)).toBe(100);
    });
  });

  describe('calculateConfidence & getRecommendation', () => {
    test('should output status VERIFIED for high confidence reports', () => {
      const validations = {
        contentMatch: { confidence: 90, warnings: [] },
        authenticityCheck: { confidence: 95, warnings: [] },
        metadataValidation: { confidence: 90, warnings: [] },
        issueClassification: { confidence: 85, warnings: [] },
      };
      const result = calculateConfidence(validations);
      expect(result.status).toBe('VERIFIED');
      expect(result.action).toBe('accept');
      expect(result.overallConfidence).toBeGreaterThanOrEqual(70);
      expect(result.recommendation.allowSubmit).toBe(true);
      expect(result.recommendation.requiresReview).toBe(false);
    });

    test('should output FLAGGED_FOR_REVIEW for borderline confidence or multiple warnings', () => {
      const validations = {
        contentMatch: { confidence: 65, warnings: ['Borderline match'] },
        authenticityCheck: { confidence: 70, warnings: ['Minor manipulation suspicion'] },
        metadataValidation: { confidence: 50, warnings: ['No EXIF data'] },
        issueClassification: { confidence: 80, warnings: [] },
      };
      const result = calculateConfidence(validations);
      expect(result.status).toBe('FLAGGED_FOR_REVIEW');
      expect(result.action).toBe('flag');
      expect(result.recommendation.allowSubmit).toBe(true);
      expect(result.recommendation.requiresReview).toBe(true);
    });

    test('should output REJECTED for extremely low confidence reports', () => {
      const validations = {
        contentMatch: { confidence: 20, warnings: ['Content mismatch'] },
        authenticityCheck: { confidence: 30, warnings: ['Tampering detected'] },
        metadataValidation: { confidence: 40, warnings: ['No EXIF'] },
        issueClassification: { confidence: 30, warnings: [] },
      };
      const result = calculateConfidence(validations);
      expect(result.status).toBe('REJECTED');
      expect(result.action).toBe('reject');
      expect(result.recommendation.allowSubmit).toBe(false);
    });
  });
});
