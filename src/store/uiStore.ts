// ============================================
// UI Store — Zustand v5
// ============================================
import { create } from 'zustand';

type Theme = 'light' | 'dark';

interface UIState {
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  activeTab: string;
  theme: Theme;
  aiAssistantOpen: boolean;
  commandPaletteOpen: boolean;
  modalStack: string[];
}

interface UIActions {
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  collapseSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setActiveTab: (tab: string) => void;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  toggleAIAssistant: () => void;
  setAIAssistantOpen: (open: boolean) => void;
  toggleCommandPalette: () => void;
  setCommandPaletteOpen: (open: boolean) => void;
  pushModal: (modalId: string) => void;
  popModal: () => void;
  clearModals: () => void;
}

type UIStore = UIState & UIActions;

const getInitialTheme = (): Theme => {
  try {
    const stored = localStorage.getItem('sg_theme');
    if (stored === 'light' || stored === 'dark') return stored;
  } catch {
    // Storage unavailable
  }
  // Respect system preference
  if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
};

const persistTheme = (theme: Theme): void => {
  try {
    localStorage.setItem('sg_theme', theme);
  } catch {
    // Storage unavailable — no-op
  }
  // Update the document class for TailwindCSS dark mode
  if (typeof document !== 'undefined') {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }
};

export const useUIStore = create<UIStore>((set, get) => ({
  // --- State ---
  sidebarOpen: true,
  sidebarCollapsed: false,
  activeTab: 'dashboard',
  theme: getInitialTheme(),
  aiAssistantOpen: false,
  commandPaletteOpen: false,
  modalStack: [],

  // --- Sidebar ---
  toggleSidebar: () => {
    set((state) => ({ sidebarOpen: !state.sidebarOpen }));
  },

  setSidebarOpen: (open: boolean) => {
    set({ sidebarOpen: open });
  },

  collapseSidebar: () => {
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed }));
  },

  setSidebarCollapsed: (collapsed: boolean) => {
    set({ sidebarCollapsed: collapsed });
  },

  // --- Navigation ---
  setActiveTab: (tab: string) => {
    set({ activeTab: tab });
  },

  // --- Theme ---
  toggleTheme: () => {
    const nextTheme: Theme = get().theme === 'light' ? 'dark' : 'light';
    persistTheme(nextTheme);
    set({ theme: nextTheme });
  },

  setTheme: (theme: Theme) => {
    persistTheme(theme);
    set({ theme });
  },

  // --- AI Assistant ---
  toggleAIAssistant: () => {
    set((state) => ({ aiAssistantOpen: !state.aiAssistantOpen }));
  },

  setAIAssistantOpen: (open: boolean) => {
    set({ aiAssistantOpen: open });
  },

  // --- Command Palette ---
  toggleCommandPalette: () => {
    set((state) => ({ commandPaletteOpen: !state.commandPaletteOpen }));
  },

  setCommandPaletteOpen: (open: boolean) => {
    set({ commandPaletteOpen: open });
  },

  // --- Modal Stack ---
  pushModal: (modalId: string) => {
    set((state) => ({
      modalStack: [...state.modalStack, modalId],
    }));
  },

  popModal: () => {
    set((state) => ({
      modalStack: state.modalStack.slice(0, -1),
    }));
  },

  clearModals: () => {
    set({ modalStack: [] });
  },
}));

// --- Apply initial theme class on module load ---
(() => {
  const theme = getInitialTheme();
  persistTheme(theme);
})();
