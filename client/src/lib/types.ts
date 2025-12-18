export interface AppState {
  attemptsLeft: number;
  correctCategory: boolean;
  correctSolution: boolean;
  solvable: boolean;
  guesses: string[];
}

export type TilesPropsMap = Map<string, { color: string; attempt: number }>;
