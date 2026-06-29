import { create } from "zustand";
type User = { id: number; name: string; email: string; role: string; language: string };
type S = { user: User | null; setUser: (u: User | null) => void };
export const useAuth = create<S>((set) => ({ user: null, setUser: (u) => set({ user: u }) }));
