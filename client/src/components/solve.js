import { Button, Tag } from 'antd';
import { useContext, useEffect, useRef, useState } from 'react';
import { CSSTransition } from 'react-transition-group';
import styled from 'styled-components';
import axios from 'axios';
import config from '../utils/config';

import Guess from './guess';
import Options from './options';
import { PuzzleContext, SolvableContext } from '../App';

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
const shuffleArray = (arr) => {
  for (let i = arr.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1)); // random index
    [arr[i], arr[j]] = [arr[j], arr[i]]; // swap elements
  }
  return arr;
};

export default function Solve({ guesses, onSubmit }) {
  const [categoryType, setCategoryType] = useState('');
  const [currentGuess, setCurrentGuess] = useState('');
  const [currentOptions, setCurrentOptions] = useState([]);

  const { correctCategory, buzzer } = useContext(PuzzleContext);
  const solvable = useContext(SolvableContext);
  const wrapperRef = useRef(null);

  const toggleOptions = !solvable || buzzer;
  const toggleSubmit = !solvable || !currentGuess || buzzer;

  useEffect(() => {
    const getCategories = async () => {
      try {
        const categoriesRes = await axios.get('/puzzle/categories');
        const categories = shuffleArray(categoriesRes.data);
        setCurrentOptions(categories);
      } catch (err) {
        console.error('getCategories() Error!', err.message);
      }
    };
    getCategories();
  }, []);

  useEffect(() => {
    if (!correctCategory) { return; }
    const getSubcategory = async () => {
      try {
        const categoryTypeRes = await axios.get('/puzzle/subcategory');
        setCategoryType(categoryTypeRes.data);
      } catch (err) {
        console.error('getSubcategory() Error!', err.message);
      }
    };
    getSubcategory();
  }, [correctCategory]);

  const checkCorrect = async (guess, type) => {
    let correct = false;
    try {
      const correctRes = await axios.get(`/check/${type}`, { params: { guess }});
      correct = correctRes.data;
    } catch (err) {
      console.error('checkCorrect() Error!', err.message);
    }
    return correct;
  };

  const handleSubmit = async () => {
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
            { correctCategory && <Tag color="dodgerblue">{categoryType}</Tag> }
            {
              !correctCategory ? (
                <Options
                  guesses={guesses}
                  options={currentOptions}
                  value={currentGuess}
                  onChange={(e) => setCurrentGuess(e.target.value)}
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