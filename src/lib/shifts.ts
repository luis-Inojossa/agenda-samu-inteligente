// Sistema de escalas 12x36 para profissionais do SAMU
export interface ShiftDay {
  date: string;
  type: 'work' | 'extra' | 'off';
  isToday?: boolean;
}

export interface ShiftSchedule {
  startDate: string;
  shifts: ShiftDay[];
}

class ShiftService {
  private storageKey = 'samu-agenda-shifts';

  // Gera escala 12x36 (trabalha 1 dia, folga 1 dia)
  generateShiftSchedule(startDate: string, months: number = 3): ShiftSchedule {
    const shifts: ShiftDay[] = [];
    const start = new Date(startDate + 'T00:00:00'); // Força horário local
    const today = new Date().toDateString();
    
    // Calcular total de dias
    const totalDays = months * 30;
    
    for (let i = 0; i < totalDays; i++) {
      const currentDate = new Date(start);
      currentDate.setDate(start.getDate() + i);
      
      // Ciclo de 2 dias: trabalha um dia, folga outro
      const dayOfCycle = i % 2;
      const type: ShiftDay['type'] = dayOfCycle === 0 ? 'work' : 'off';
      
      shifts.push({
        date: currentDate.toISOString().split('T')[0],
        type,
        isToday: currentDate.toDateString() === today
      });
    }
    
    return {
      startDate,
      shifts
    };
  }

  saveShiftSchedule(userId: string, schedule: ShiftSchedule): void {
    if (typeof window === 'undefined') return;
    
    const key = `${this.storageKey}-${userId}`;
    localStorage.setItem(key, JSON.stringify(schedule));
  }

  getShiftSchedule(userId: string): ShiftSchedule | null {
    if (typeof window === 'undefined') return null;
    
    try {
      const key = `${this.storageKey}-${userId}`;
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  addExtraShift(userId: string, date: string): void {
    const schedule = this.getShiftSchedule(userId);
    if (!schedule) return;

    const shiftIndex = schedule.shifts.findIndex(s => s.date === date);
    if (shiftIndex >= 0) {
      schedule.shifts[shiftIndex].type = 'extra';
      this.saveShiftSchedule(userId, schedule);
    }
  }

  removeExtraShift(userId: string, date: string): void {
    const schedule = this.getShiftSchedule(userId);
    if (!schedule) return;

    const shiftIndex = schedule.shifts.findIndex(s => s.date === date);
    if (shiftIndex >= 0) {
      // Recalcular o tipo baseado na posição original
      const startDate = new Date(schedule.startDate + 'T00:00:00'); // Força horário local
      const currentDate = new Date(date + 'T00:00:00'); // Força horário local
      
      // Calcular diferença em dias de forma mais precisa
      const timeDiff = currentDate.getTime() - startDate.getTime();
      const daysSinceStart = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
      
      // Garantir que daysSinceStart seja sempre >= 0
      const safeDaysSinceStart = Math.max(0, daysSinceStart);
      
      // Ciclo de 2 dias: trabalha um dia, folga outro
      const dayOfCycle = safeDaysSinceStart % 2;
      schedule.shifts[shiftIndex].type = dayOfCycle === 0 ? 'work' : 'off';
      this.saveShiftSchedule(userId, schedule);
    }
  }

  getMonthShifts(userId: string, year: number, month: number): ShiftDay[] {
    const schedule = this.getShiftSchedule(userId);
    if (!schedule) return [];

    return schedule.shifts.filter(shift => {
      const shiftDate = new Date(shift.date + 'T00:00:00'); // Força horário local
      return shiftDate.getFullYear() === year && shiftDate.getMonth() === month;
    });
  }

  getShiftStats(userId: string, year: number, month: number): {
    workDays: number;
    extraDays: number;
    offDays: number;
  } {
    const monthShifts = this.getMonthShifts(userId, year, month);
    
    return {
      workDays: monthShifts.filter(s => s.type === 'work').length,
      extraDays: monthShifts.filter(s => s.type === 'extra').length,
      offDays: monthShifts.filter(s => s.type === 'off').length,
    };
  }
}

export const shiftService = new ShiftService();