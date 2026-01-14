import axios from 'axios';
import { Button, Tag } from 'antd';
import { CSSTransition } from 'react-transition-group';
import { RadioChangeEvent } from 'antd/es/radio';
import styled from 'styled-components';
import { useContext, useEffect, useRef, useState } from 'react';

import Guess from './guess';
import Options from './options';

import { AppState } from '../lib/types';
import config from '../utils/config';
import { PuzzleContext, SolvableContext } from '../lib/contexts';

interface SolveProps {
  guesses: string[];
  onSubmit: (updateFn: (prevState: AppState) => AppState) => void;
}

const StyledSolve = styled.div`
  ${({ theme }) => theme.recycle.flexCenter};

  margin-top: var(--space-l);

  .ant-btn-primary {
    border-radius: var(--space-s);
    transition:
      background ${config.duration}ms,
      border ${config.duration}ms,
      color ${config.duration}ms;

    // increase specificity to override antd
    &[disabled] {
      border: 1px solid var(--disabled);
      color: var(--disabled);
    }
  }
`;

const StyledWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  // tag
  & > span:first-child {
    margin-bottom: var(--space-s);
  }
`;

// fisher-yates shuffle
const shuffleArray = <T,>(arr: T[]): T[] => {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1)); // random index
    [arr[i], arr[j]] = [arr[j]!, arr[i]!]; // swap elements
  }
  return arr;
};

export default function Solve({ guesses, onSubmit }: SolveProps) {
  const [categoryType, setCategoryType] = useState('');
  const [currentGuess, setCurrentGuess] = useState('');
  const [currentOptions, setCurrentOptions] = useState<string[]>([]);

  const { correctCategory, buzzer } = useContext(PuzzleContext);
  const solvable = useContext(SolvableContext);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const toggleOptions = !solvable || buzzer;
  const toggleSubmit = !solvable || !currentGuess || buzzer;

  useEffect(() => {
    const getCategories = async (): Promise<void> => {
      try {
        const categoriesRes = await axios.get<string[]>('/puzzle/categories');
        const categories = shuffleArray(categoriesRes.data);
        setCurrentOptions(categories);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        console.error('getCategories() Error!', errorMessage);
      }
    };
    getCategories();
  }, []);

  useEffect(() => {
    if (!correctCategory) { return; }
    const getSubcategory = async (): Promise<void> => {
      try {
        const categoryTypeRes = await axios.get<string>('/puzzle/subcategory');
        setCategoryType(categoryTypeRes.data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        console.error('getSubcategory() Error!', errorMessage);
      }
    };
    getSubcategory();
  }, [correctCategory]);

  const checkCorrect = async (guess: string, type: string): Promise<boolean> => {
    let correct = false;
    try {
      const correctRes = await axios.get<boolean>(`/check/${type}`, { params: { guess }});
      correct = correctRes.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('checkCorrect() Error!', errorMessage);
    }
    return correct;
  };

  const handleSubmit = async (): Promise<void> => {
    if (!currentGuess) { return; }

    const checkMode = correctCategory ? 'solution' : 'category';
    const correctGuess = await checkCorrect(currentGuess, checkMode);

    if (correctGuess) {
      onSubmit((prevState) => ({
        ...prevState,
        correctCategory: correctGuess,
        correctSolution: correctCategory && correctGuess,
        guesses: []
      }));
    } else {
      onSubmit((prevState) => ({
        ...prevState,
        attemptsLeft: prevState.attemptsLeft - 1,
        solvable: false,
        guesses: [...prevState.guesses, currentGuess]
      }));
    }

    setCurrentGuess('');
  };

  return (
    <StyledSolve>
      <div id="solve">
        <CSSTransition
          in={correctCategory}
          nodeRef={wrapperRef}
          timeout={config.duration * 3}
          classNames="fade"
        >
          <StyledWrapper ref={wrapperRef}>
            { correctCategory && <Tag>{categoryType}</Tag> }
            {
              !correctCategory ? (
                <Options
                  guesses={guesses}
                  options={currentOptions}
                  value={currentGuess}
                  onChange={(e: RadioChangeEvent) => setCurrentGuess(e.target.value as string)}
                  disabled={toggleOptions}
                />
              ) : (
                <Guess
                  disabled={toggleOptions}
                  value={currentGuess}
                  onChange={(e) => setCurrentGuess(e.target.value)}
                  onPressEnter={handleSubmit}
                />
              )
            }
            <Button
              type="primary"
              onClick={handleSubmit}
              disabled={toggleSubmit}
            >
              { config.actions.submit }
            </Button>
          </StyledWrapper>
        </CSSTransition>
      </div>
    </StyledSolve>
  );
}
