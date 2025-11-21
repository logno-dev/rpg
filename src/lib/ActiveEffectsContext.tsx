import { createContext, useContext, ParentComponent, onCleanup } from "solid-js";
import { createStore } from "solid-js/store";

export type ActiveEffect = {
  id: string; // unique identifier
  name: string;
  stat: string; // which stat it affects (constitution, strength, etc)
  amount: number; // how much it boosts
  expiresAt: number; // timestamp when it expires
  duration: number; // original duration in seconds
};

type ActiveEffectsStore = {
  effects: ActiveEffect[];
};

type ActiveEffectsContextValue = [
  store: ActiveEffectsStore,
  actions: {
    addEffect: (effect: Omit<ActiveEffect, 'id' | 'expiresAt'>) => void;
    removeEffect: (id: string) => void;
    clearExpiredEffects: () => void;
    getTotalStatBonus: (stat: string) => number;
  }
];

const ActiveEffectsContext = createContext<ActiveEffectsContextValue>();

export const ActiveEffectsProvider: ParentComponent = (props) => {
  const [store, setStore] = createStore<ActiveEffectsStore>({
    effects: [],
  });

  // Timer to check for expired effects every second
  const intervalId = setInterval(() => {
    actions.clearExpiredEffects();
  }, 1000);

  onCleanup(() => {
    clearInterval(intervalId);
  });

  const actions = {
    addEffect: (effect: Omit<ActiveEffect, 'id' | 'expiresAt'>) => {
      const now = Date.now();
      const newEffect: ActiveEffect = {
        ...effect,
        id: `${effect.name}-${now}`,
        expiresAt: now + effect.duration * 1000,
      };

      console.log('[EFFECTS] Adding effect:', newEffect.name, `+${newEffect.amount} ${newEffect.stat}`, `for ${newEffect.duration}s`);
      
      setStore('effects', (effects) => [...effects, newEffect]);
    },

    removeEffect: (id: string) => {
      setStore('effects', (effects) => effects.filter((e) => e.id !== id));
    },

    clearExpiredEffects: () => {
      const now = Date.now();
      setStore('effects', (effects) => {
        const remaining = effects.filter((e) => e.expiresAt > now);
        const expired = effects.filter((e) => e.expiresAt <= now);
        
        if (expired.length > 0) {
          console.log('[EFFECTS] Expired:', expired.map(e => e.name).join(', '));
        }
        
        return remaining;
      });
    },

    getTotalStatBonus: (stat: string) => {
      return store.effects
        .filter((e) => e.stat === stat)
        .reduce((total, e) => total + e.amount, 0);
    },
  };

  return (
    <ActiveEffectsContext.Provider value={[store, actions]}>
      {props.children}
    </ActiveEffectsContext.Provider>
  );
};

export function useActiveEffects() {
  const context = useContext(ActiveEffectsContext);
  if (!context) {
    throw new Error("useActiveEffects must be used within an ActiveEffectsProvider");
  }
  return context;
}
