
import { SavedSession, User } from '../types';

const SESSIONS_KEY = 'sandplay_sessions';
const USERS_KEY = 'sandplay_users';

export const persistence = {
  // Save a new session to the history
  saveSession: (session: Omit<SavedSession, 'id'>) => {
    const sessions: SavedSession[] = JSON.parse(localStorage.getItem(SESSIONS_KEY) || '[]');
    const newSession: SavedSession = { ...session, id: Date.now().toString() };
    sessions.push(newSession);
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
    return newSession;
  },

  // Retrieve all saved sessions (LIFO order usually preferred for history)
  getAllSessions: (): SavedSession[] => {
    const sessions: SavedSession[] = JSON.parse(localStorage.getItem(SESSIONS_KEY) || '[]');
    return sessions.sort((a, b) => Number(b.id) - Number(a.id));
  },

  // Clear history if needed (utility)
  clearHistory: () => {
    localStorage.removeItem(SESSIONS_KEY);
  },

  // Register a new user
  register: (username: string, key: string): { user?: User; error?: string } => {
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '{}');
    if (users[username]) {
      return { error: 'Username already taken.' };
    }
    // Store user with simple key
    users[username] = { key };
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    
    return { 
      user: { id: username, username } 
    };
  },

  // Login existing user
  login: (username: string, key: string): { user?: User; error?: string } => {
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '{}');
    const storedUser = users[username];
    
    if (!storedUser) {
      return { error: 'User not found.' };
    }
    
    if (storedUser.key !== key) {
      return { error: 'Invalid secret key.' };
    }

    return { 
      user: { id: username, username } 
    };
  }
};
