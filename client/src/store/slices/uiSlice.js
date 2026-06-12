import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    theme: 'light',
    sidebarOpen: false,
    searchOpen: false,
    mobileMenuOpen: false,
    pageLoading: false,
  },
  reducers: {
    toggleSidebar: (state) => { state.sidebarOpen = !state.sidebarOpen; },
    setSidebar: (state, action) => { state.sidebarOpen = action.payload; },
    toggleSearch: (state) => { state.searchOpen = !state.searchOpen; },
    closeSearch: (state) => { state.searchOpen = false; },
    toggleMobileMenu: (state) => { state.mobileMenuOpen = !state.mobileMenuOpen; },
    closeMobileMenu: (state) => { state.mobileMenuOpen = false; },
    setPageLoading: (state, action) => { state.pageLoading = action.payload; },
  },
});

export const { toggleSidebar, setSidebar, toggleSearch, closeSearch, toggleMobileMenu, closeMobileMenu, setPageLoading } = uiSlice.actions;
export default uiSlice.reducer;
