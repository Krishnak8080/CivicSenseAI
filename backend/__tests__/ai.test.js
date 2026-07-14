const { calculatePriority } = require('../utils/ai');

describe('Priority Analysis helper', () => {
  test('should classify critical keywords as High priority', () => {
    const issue = {
      description: 'There is a major fire breakout in the building',
      votes: 0,
      createdAt: new Date().toISOString(),
    };
    // Score should be fire (60) + hours (0) + votes (0) = 60. Wait, 60 is Medium (score >= 40).
    // Let's add multiple critical tags or check the score math.
    // If it contains "fire" and "accident", score is 60 + 60 = 120 (>= 80 -> High).
    const result = calculatePriority(issue);
    expect(result.score).toBeGreaterThanOrEqual(60);
    expect(result.priority).toBe('Medium'); // Single critical word is Medium

    const criticalIssue = {
      description: 'There is a fire accident with serious injury',
      votes: 0,
      createdAt: new Date().toISOString(),
    };
    // fire (60) + accident (60) + injury (60) = 180 (>= 80 -> High)
    const criticalResult = calculatePriority(criticalIssue);
    expect(criticalResult.score).toBeCloseTo(180, 2);
    expect(criticalResult.priority).toBe('High');
  });

  test('should classify moderate keywords as Medium priority', () => {
    const issue = {
      description: 'Garbage pile blocking the street corner and leaking sewage',
      votes: 0,
      createdAt: new Date().toISOString(),
    };
    // garbage (30) + sewage (30) = 60 (>= 40 -> Medium)
    const result = calculatePriority(issue);
    expect(result.priority).toBe('Medium');
  });

  test('should classify low keywords as Low priority when new and no votes', () => {
    const issue = {
      description: 'Minor maintenance delay',
      votes: 0,
      createdAt: new Date().toISOString(),
    };
    // maintenance (10) + delay (10) = 20 (< 40 -> Low)
    const result = calculatePriority(issue);
    expect(result.priority).toBe('Low');
  });

  test('should escalate priority when user votes increase', () => {
    const issue = {
      description: 'cleanliness issue',
      votes: 15, // 15 votes * 5 = 75 points
      createdAt: new Date().toISOString(),
    };
    // cleanliness (10) + votes (75) = 85 (>= 80 -> High)
    const result = calculatePriority(issue);
    expect(result.score).toBeCloseTo(85, 2);
    expect(result.priority).toBe('High');
  });

  test('should increase priority score as time passes', () => {
    const freshIssue = {
      description: 'Garbage on street corner',
      votes: 0,
      createdAt: new Date().toISOString(),
    };
    // garbage (30) + time (0) = 30 -> Medium/Low boundary
    const freshResult = calculatePriority(freshIssue);
    expect(freshResult.priority).toBe('Low');

    const twoDaysOldDate = new Date();
    twoDaysOldDate.setHours(twoDaysOldDate.getHours() - 48); // 48 hours ago
    const oldIssue = {
      description: 'Garbage on street corner',
      votes: 0,
      createdAt: twoDaysOldDate.toISOString(),
    };
    // garbage (30) + time (capped at 24) = 54 (>= 40 -> Medium)
    const oldResult = calculatePriority(oldIssue);
    expect(oldResult.score).toBeCloseTo(54, 2);
    expect(oldResult.priority).toBe('Medium');
  });
});
