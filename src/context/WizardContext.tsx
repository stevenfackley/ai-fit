import React, { createContext, useContext, useState, useCallback } from 'react';

export interface WizardState {
  projectDescription: string;
  useCases: string[];
  budget: number;
  maxLatencyMs: number;
  compliance: string[];
  preferredProviders: string[];
}

interface WizardContextValue {
  state: WizardState;
  update: (patch: Partial<WizardState>) => void;
  reset: () => void;
}

const DEFAULT: WizardState = {
  projectDescription: '',
  useCases: [],
  budget: 50,
  maxLatencyMs: 1000,
  compliance: [],
  preferredProviders: ['openai', 'anthropic'],
};

const WizardContext = createContext<WizardContextValue | null>(null);

export function WizardProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<WizardState>(DEFAULT);

  const update = useCallback((patch: Partial<WizardState>) => {
    setState((prev) => ({ ...prev, ...patch }));
  }, []);

  const reset = useCallback(() => setState(DEFAULT), []);

  return (
    <WizardContext.Provider value={{ state, update, reset }}>
      {children}
    </WizardContext.Provider>
  );
}

export function useWizard(): WizardContextValue {
  const ctx = useContext(WizardContext);
  if (!ctx) throw new Error('useWizard must be used within WizardProvider');
  return ctx;
}
