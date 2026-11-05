const API_BASE = '/api';

function getAuthHeaders() {
  const token = localStorage.getItem('banana_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
}

export async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    ...getAuthHeaders(),
    ...options.headers
  };

  try {
    const res = await fetch(url, { ...options, headers });
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(data.message || `Request failed with status ${res.status}`);
    }

    return data;
  } catch (err) {
    throw err;
  }
}

// 1. Auth Services
export const authApi = {
  login: (identifier, password) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, password })
    }),
  register: (username, email, password, avatar) =>
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password, avatar })
    }),
  getMe: () => request('/auth/me')
};

// 2. Game Services
export const gameApi = {
  startRound: () => request('/game/start', { method: 'POST' }),
  requestHint: (roundId) =>
    request('/game/hint', {
      method: 'POST',
      body: JSON.stringify({ roundId })
    }),
  submitAnswer: (roundId, answer, timeRemaining) =>
    request('/game/submit', {
      method: 'POST',
      body: JSON.stringify({ roundId, answer, timeRemaining })
    })
};

// 3. Leaderboard Services
export const leaderboardApi = {
  getTopScores: () => request('/leaderboard/top-scores'),
  getTopAccuracy: () => request('/leaderboard/accuracy')
};

// 4. Profile Services
export const profileApi = {
  getProfile: () => request('/profile'),
  updateAvatar: (avatar) =>
    request('/profile/avatar', {
      method: 'PUT',
      body: JSON.stringify({ avatar })
    })
};
