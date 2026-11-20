import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ScreenTimeState {
  date: string; // YYYY-MM-DD
  totalSecondsToday: number;
  folderSeconds: Record<string, number>;
  dailyGoalMinutes: number;
  breakReminderMinutes: number;
  isModalOpen: boolean;
  showBreakAlert: boolean;
}

const getTodayString = () => new Date().toISOString().split('T')[0];

const initialState: ScreenTimeState = {
  date: getTodayString(),
  totalSecondsToday: 0,
  folderSeconds: {},
  dailyGoalMinutes: 60, // 1 hour default focus target
  breakReminderMinutes: 30, // 30 min break reminder
  isModalOpen: false,
  showBreakAlert: false,
};

const screenTimeSlice = createSlice({
  name: 'screenTime',
  initialState,
  reducers: {
    incrementScreenTime: (state, action: PayloadAction<{ folderSlug?: string }>) => {
      const today = getTodayString();
      // If date rolled over, reset today's counter
      if (state.date !== today) {
        state.date = today;
        state.totalSecondsToday = 0;
        state.folderSeconds = {};
        state.showBreakAlert = false;
      }

      state.totalSecondsToday += 1;
      const slug = action.payload.folderSlug || 'general';
      state.folderSeconds[slug] = (state.folderSeconds[slug] || 0) + 1;

      // Check break reminder
      const reminderSec = state.breakReminderMinutes * 60;
      if (
        reminderSec > 0 &&
        state.totalSecondsToday > 0 &&
        state.totalSecondsToday % reminderSec === 0
      ) {
        state.showBreakAlert = true;
      }

      // Persist to local storage periodically
      if (typeof window !== 'undefined' && state.totalSecondsToday % 5 === 0) {
        try {
          localStorage.setItem(
            'zen_screen_time',
            JSON.stringify({
              date: state.date,
              totalSecondsToday: state.totalSecondsToday,
              folderSeconds: state.folderSeconds,
              dailyGoalMinutes: state.dailyGoalMinutes,
              breakReminderMinutes: state.breakReminderMinutes,
            })
          );
        } catch {}
      }
    },
    loadScreenTimeFromStorage: (state, action: PayloadAction<Partial<ScreenTimeState>>) => {
      const today = getTodayString();
      if (action.payload.date === today) {
        state.totalSecondsToday = action.payload.totalSecondsToday || 0;
        state.folderSeconds = action.payload.folderSeconds || {};
      }
      if (action.payload.dailyGoalMinutes) {
        state.dailyGoalMinutes = action.payload.dailyGoalMinutes;
      }
      if (action.payload.breakReminderMinutes) {
        state.breakReminderMinutes = action.payload.breakReminderMinutes;
      }
    },
    resetScreenTime: (state) => {
      state.totalSecondsToday = 0;
      state.folderSeconds = {};
      state.showBreakAlert = false;
      if (typeof window !== 'undefined') {
        try {
          localStorage.removeItem('zen_screen_time');
        } catch {}
      }
    },
    setDailyGoalMinutes: (state, action: PayloadAction<number>) => {
      state.dailyGoalMinutes = action.payload;
    },
    setBreakReminderMinutes: (state, action: PayloadAction<number>) => {
      state.breakReminderMinutes = action.payload;
    },
    setScreenTimeModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isModalOpen = action.payload;
    },
    dismissBreakAlert: (state) => {
      state.showBreakAlert = false;
    },
  },
});

export const {
  incrementScreenTime,
  loadScreenTimeFromStorage,
  resetScreenTime,
  setDailyGoalMinutes,
  setBreakReminderMinutes,
  setScreenTimeModalOpen,
  dismissBreakAlert,
} = screenTimeSlice.actions;

export default screenTimeSlice.reducer;
