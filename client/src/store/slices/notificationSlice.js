import { createSlice } from '@reduxjs/toolkit';

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: {
    items: [],
    unreadCount: 0,
    isOpen: false,
  },
  reducers: {
    addNotification: (state, action) => {
      state.items.unshift(action.payload);
      state.unreadCount += 1;
    },
    markAsRead: (state, action) => {
      const notif = state.items.find(n => n._id === action.payload);
      if (notif && !notif.isRead) {
        notif.isRead = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    markAllAsRead: (state) => {
      state.items.forEach(n => n.isRead = true);
      state.unreadCount = 0;
    },
    setNotifications: (state, action) => {
      state.items = action.payload;
      state.unreadCount = action.payload.filter(n => !n.isRead).length;
    },
    toggleNotifications: (state) => { state.isOpen = !state.isOpen; },
    closeNotifications: (state) => { state.isOpen = false; },
  },
});

export const { addNotification, markAsRead, markAllAsRead, setNotifications, toggleNotifications, closeNotifications } = notificationSlice.actions;
export default notificationSlice.reducer;
