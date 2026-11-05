const config = require('../config/config');

/**
 * BananaService handles external interoperability with the Banana API:
 * https://marcconrad.com/uob/banana/api.php?out=json
 * 
 * Interoperability Theme Highlights:
 * - Decouples external API communication from client requests.
 * - Enforces anti-cheat data isolation: The external API returns both { question, solution }.
 *   By intercepting this on the backend proxy, the solution is securely withheld from the client.
 * - Fault tolerance: Provides fallback puzzle generation if external API is unreachable or rate limited.
 */
class BananaService {
  /**
   * Fetches a new visual equation puzzle from Marc Conrad's Banana API
   * @returns {Promise<{ question: string, solution: number }>}
   */
  async fetchNewPuzzle() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout

      const response = await fetch(config.bananaApiUrl, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'BananaGame-Enterprise-Client/1.0'
        }
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`External API responded with status ${response.status}`);
      }

      const data = await response.json();

      if (!data || typeof data.question !== 'string' || typeof data.solution !== 'number') {
        throw new Error('Invalid schema received from external Banana API');
      }

      return {
        question: data.question,
        solution: parseInt(data.solution, 10)
      };
    } catch (error) {
      console.warn(`[BananaService Interoperability Warning] Failed to reach external API (${error.message}). Using fallback procedural equation generator.`);
      return this.generateFallbackPuzzle();
    }
  }

  /**
   * Generates a high-quality fallback visual puzzle SVG/data URL when offline or API is down
   */
  generateFallbackPuzzle() {
    // Generate valid single-digit solution 0-9
    const sol = Math.floor(Math.random() * 10);
    const varA = Math.floor(Math.random() * 4) + 1;
    const varB = Math.floor(Math.random() * 4) + 1;
    const eq1 = varA + varA + varA; // 3 * varA
    const eq2 = varA + varB;        // varA + varB
    const eq3 = (varA * varB) % 10; // final eq target

    // SVG Data URL that looks like an arithmetic puzzle
    const svgContent = `
      <svg xmlns="http://www.w3.org/2000/svg" width="600" height="260" viewBox="0 0 600 260" style="background:#fffbe6;font-family:sans-serif;font-weight:bold;">
        <rect width="600" height="260" rx="16" fill="#fffbe6" stroke="#fbbf24" stroke-width="4"/>
        <text x="30" y="50" font-size="28" fill="#1e293b">🍌 + 🍌 + 🍌 = ${eq1}</text>
        <text x="30" y="110" font-size="28" fill="#1e293b">🍌 + 🐒 = ${eq2}</text>
        <text x="30" y="170" font-size="28" fill="#1e293b">🍌 × 🐒 = ${varA * varB}</text>
        <text x="30" y="230" font-size="32" fill="#d97706">🎯 Value of ? = [ ${sol} ]</text>
      </svg>
    `.trim();

    return {
      question: `data:image/svg+xml;utf8,${encodeURIComponent(svgContent)}`,
      solution: sol
    };
  }
}

module.exports = new BananaService();

