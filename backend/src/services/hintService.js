/**
 * HintService: Manages the progressive 3-step hint system.
 * 
 * Rules:
 * - Step 1: Parity & Macro Range (e.g., Even/Odd & High/Low). Penalty: -15 pts.
 * - Step 2: Set Elimination (Eliminates non-solutions, leaving 3 candidate choices). Penalty: -25 pts.
 * - Step 3: Exact Boundary / Mathematical Clue (Immediate neighbors or strict range). Penalty: -35 pts.
 * 
 * Guarantees that at no step does the API expose the raw solution directly,
 * preventing data leaks and client tampering.
 */
class HintService {
  /**
   * Generates progressive hint payload based on the requested level
   * @param {number} solution Integer between 0 and 9
   * @param {number} requestedLevel 1, 2, or 3
   * @returns {{ level: number, text: string, penalty: number, candidates?: number[] }}
   */
  generateHint(solution, requestedLevel) {
    const isEven = solution % 2 === 0;
    const isHigh = solution >= 5;

    switch (requestedLevel) {
      case 1: {
        const parityText = isEven ? 'an EVEN number (0, 2, 4, 6, 8)' : 'an ODD number (1, 3, 5, 7, 9)';
        const rangeText = isHigh ? 'greater than or equal to 5 (5 - 9)' : 'less than 5 (0 - 4)';
        return {
          level: 1,
          cost: 15,
          type: 'Parity & Range Analysis',
          text: `Hint 1: The solution is ${parityText} and is ${rangeText}.`
        };
      }

      case 2: {
        // Build candidate set with true solution + 2 plausible random distractors
        const allDigits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
        const distractors = allDigits
          .filter(d => d !== solution)
          .sort(() => 0.5 - Math.random())
          .slice(0, 2);

        const candidates = [...distractors, solution].sort((a, b) => a - b);

        return {
          level: 2,
          cost: 25,
          type: 'Candidate Elimination',
          text: `Hint 2: We eliminated 7 incorrect options! The true solution is definitely one of: [ ${candidates.join(', ')} ].`,
          candidates
        };
      }

      case 3: {
        let boundaryText = '';
        if (solution === 0) {
          boundaryText = 'It is the lowest single-digit non-negative integer (0 or 1)';
        } else if (solution === 9) {
          boundaryText = 'It is the highest possible single-digit integer (8 or 9)';
        } else {
          boundaryText = `It is strictly bordered between ${solution - 1} and ${solution + 1}`;
        }

        return {
          level: 3,
          cost: 35,
          type: 'Tight Boundary & Exact Equation',
          text: `Hint 3: Precision Clue: ${boundaryText}! (Answer format is a single digit).`
        };
      }

      default:
        throw new Error('Invalid hint level requested. Must be 1, 2, or 3.');
    }
  }

  /**
   * Calculate remaining points after penalties
   */
  calculateRoundScore(baseScore = 100, hintLevel = 0, timeRemaining = 0, streak = 0) {
    let penalty = 0;
    if (hintLevel >= 1) penalty += 15;
    if (hintLevel >= 2) penalty += 25;
    if (hintLevel >= 3) penalty += 35;

    // Time bonus: up to +30 points for fast responses (max 30s)
    const timeBonus = Math.min(30, Math.max(0, Math.floor(timeRemaining)));

    // Streak multiplier (e.g. 1 streak = 1.0, 2 = 1.2, 3 = 1.5, 5+ = 2.0)
    let streakMultiplier = 1.0;
    if (streak >= 5) streakMultiplier = 2.0;
    else if (streak >= 3) streakMultiplier = 1.5;
    else if (streak >= 2) streakMultiplier = 1.2;

    const rawScore = (baseScore + timeBonus - penalty);
    const finalScore = Math.max(10, Math.round(rawScore * streakMultiplier));

    return {
      pointsAwarded: finalScore,
      breakdown: {
        baseScore,
        timeBonus,
        hintPenalty: penalty,
        streakMultiplier
      }
    };
  }
}

module.exports = new HintService();

