import { createContext } from 'react';

export interface PuzzleContextValue {
  correctCategory: boolean;
  correctSolution: boolean;
  buzzer: boolean;
}

export const PuzzleContext = createContext<PuzzleContextValue>({
  correctCategory: false,
  correctSolution: false,
  buzzer: false
});

export const SolvableContext = createContext<boolean>(false);
