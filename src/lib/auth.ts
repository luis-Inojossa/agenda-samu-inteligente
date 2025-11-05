// Sistema de autenticação usando localStorage
export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  startDate?: string;
  trialEndsAt?: string;
  isSubscribed?: boolean;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

class AuthService {
  private storageKey = 'samu-agenda-auth';

  getAuthState(): AuthState {
    if (typeof window === 'undefined') {
      return { user: null, isAuthenticated: false };
    }

    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const user = JSON.parse(stored);
        return { user, isAuthenticated: true };
      }
    } catch (error) {
      console.error('Erro ao carregar dados de autenticação:', error);
    }

    return { user: null, isAuthenticated: false };
  }

  async login(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    // Simular verificação de login
    const users = this.getStoredUsers();
    const user = users.find(u => u.email === email);

    if (!user) {
      return { success: false, error: 'Usuário não encontrado' };
    }

    // Em um app real, verificaríamos a senha hasheada
    this.setCurrentUser(user);
    return { success: true };
  }

  async register(userData: {
    name: string;
    email: string;
    phone?: string;
    password: string;
  }): Promise<{ success: boolean; error?: string }> {
    const users = this.getStoredUsers();
    
    if (users.find(u => u.email === userData.email)) {
      return { success: false, error: 'E-mail já cadastrado' };
    }

    const newUser: User = {
      id: Date.now().toString(),
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
      trialEndsAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 dias
      isSubscribed: false,
    };

    users.push(newUser);
    this.setStoredUsers(users);
    this.setCurrentUser(newUser);

    return { success: true };
  }

  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.storageKey);
    }
  }

  updateUser(userData: Partial<User>): void {
    const currentState = this.getAuthState();
    if (currentState.user) {
      const updatedUser = { ...currentState.user, ...userData };
      this.setCurrentUser(updatedUser);
      
      // Atualizar na lista de usuários também
      const users = this.getStoredUsers();
      const userIndex = users.findIndex(u => u.id === updatedUser.id);
      if (userIndex >= 0) {
        users[userIndex] = updatedUser;
        this.setStoredUsers(users);
      }
    }
  }

  private setCurrentUser(user: User): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.storageKey, JSON.stringify(user));
    }
  }

  private getStoredUsers(): User[] {
    if (typeof window === 'undefined') return [];
    
    try {
      const stored = localStorage.getItem('samu-agenda-users');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private setStoredUsers(users: User[]): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('samu-agenda-users', JSON.stringify(users));
    }
  }
}

export const authService = new AuthService();