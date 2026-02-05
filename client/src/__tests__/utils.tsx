import { render, RenderOptions } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { ReactElement, ReactNode } from 'react';

import { PuzzleContext, PuzzleContextValue, SolvableContext } from '../lib/contexts';
import theme from '../styles/theme';

// default puzzle context values for testing
export const defaultPuzzleContext: PuzzleContextValue = {
  correctCategory: false,
  correctSolution: false,
  buzzer: false
};

// custom render with all providers
interface ProviderOptions extends Omit<RenderOptions, 'wrapper'> {
  puzzleContext?: PuzzleContextValue;
  solvable?: boolean;
}

export function renderWithProviders(
  ui: ReactElement,
  {
    puzzleContext = defaultPuzzleContext,
    solvable = false,
    ...options
  }: ProviderOptions = {}
) {
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <ThemeProvider theme={theme}>
      <PuzzleContext.Provider value={puzzleContext}>
        <SolvableContext.Provider value={solvable}>
          {children}
        </SolvableContext.Provider>
      </PuzzleContext.Provider>
    </ThemeProvider>
  );

  return render(ui, { wrapper: Wrapper, ...options });
}

// re-export everything from testing-library and vitest
export * from '@testing-library/react';
export { vi } from 'vitest';
