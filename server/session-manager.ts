// Simple session management for serverless functions
// In production, you'd use Redis, JWT tokens, or a proper session store

interface Session {
  userId: string;
  username: string;
  createdAt: number;
}

// Global session storage (shared across function instances)
const sessions = new Map<string, Session>();

// Session timeout (1 hour)
const SESSION_TIMEOUT = 60 * 60 * 1000;

export function generateSessionId(): string {
  return Math.random().toString(36).substring(2, 34);
}

export function createSession(sessionId: string, userId: string, username: string): void {
  sessions.set(sessionId, {
    userId,
    username,
    createdAt: Date.now(),
  });
}

export function getSession(sessionId: string): Session | null {
  const session = sessions.get(sessionId);
  if (!session) {
    return null;
  }

  // Check if session is expired
  if (Date.now() - session.createdAt > SESSION_TIMEOUT) {
    sessions.delete(sessionId);
    return null;
  }

  return session;
}

export function deleteSession(sessionId: string): void {
  sessions.delete(sessionId);
}

export function requireAuth(req: any): Session | null {
  const sessionId = req.headers['x-session-id'];
  if (!sessionId || typeof sessionId !== 'string') {
    return null;
  }
  return getSession(sessionId);
}

// Clean up expired sessions periodically
setInterval(() => {
  const now = Date.now();
  const expiredSessions: string[] = [];
  sessions.forEach((session, sessionId) => {
    if (now - session.createdAt > SESSION_TIMEOUT) {
      expiredSessions.push(sessionId);
    }
  });
  expiredSessions.forEach(sessionId => sessions.delete(sessionId));
}, 5 * 60 * 1000); // Clean up every 5 minutes