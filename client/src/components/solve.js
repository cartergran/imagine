import { Button, Tag } from 'antd';
import { startTransition, useContext, useEffect, useRef, useState } from 'react';
import { CSSTransition } from 'react-transition-group';
import styled from 'styled-components';
import axios from 'axios';
import config from '../utils/config';

import { PuzzleContext, SolvableContext } from '../App';
import Options from './options';

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

  // options
  & > div:has(+ button) {
    margin-bottom: var(--space-m);
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

export default function Solve({ guesses, handleGuessChange, onSubmit }) {
  const [currentOptions, setCurrentOptions] = useState([]);
  const [categoryType, setCategoryType] = useState('');

  const { correctCategory, buzzer } = useContext(PuzzleContext);
  const solvable = useContext(SolvableContext);
  const wrapperRef = useRef(null);

  const toggleOptions = !solvable || buzzer;
  const toggleSubmit = !solvable || !guesses.current || buzzer;

  useEffect(() => {
    const getCategories = async () => {
      let categoriesRes = await axios.get('categories');
      let categories = shuffleArray(categoriesRes.data);
      setCurrentOptions(categories)
    };
    getCategories();
  }, []);

  useEffect(() => {
    if (!correctCategory) { return; }
    const getCategoryChoices = async () => {
      let categoryChoicesRes = await axios.get('categoryChoices');
      let categoryChoices = shuffleArray(categoryChoicesRes.data);
      return categoryChoices;
    };
    const getCategoryType = async () => {
      let categoryTypeRes = await axios.get('categoryType');
      return categoryTypeRes.data;
    };
    const onCorrectCategory = async () => {
      let categoryChoices = await getCategoryChoices();
      let categoryType = await getCategoryType();
      startTransition(() => {
        setCurrentOptions(categoryChoices);
        setCategoryType(categoryType);
      });
    };
    onCorrectCategory();
  }, [correctCategory]);

  const checkCorrect = async (guess, type) => {
    let correct = false;
    try {
      let correctRes = await axios.get(`check/${type}`, { params: { guess }});
      correct = correctRes.data;
      (type === 'category' && correct) &&
        onSubmit((prevState) => { return {...prevState, correctCategory: correct }});
    } catch (err) {
      console.log('checkCorrect() Error!', err.message);
    }
    return correct;
  };

  const handleSubmit = async () => {
    let correctGuess =
      await checkCorrect(guesses.current, correctCategory ? 'solution' : 'category');

    if (correctGuess) {
      onSubmit((prevState) => ({
        ...prevState,
        correctCategory: correctGuess,
        correctSolution: correctCategory && correctGuess,
        guesses: { current: '', previous: [] }
      }));
    } else {
      onSubmit((prevState) => ({
        ...prevState,
        attemptsLeft: prevState.attemptsLeft - 1,
        solvable: false,
        guesses: { previous: Object.values(prevState.guesses).flat(), current: '' }
      }));
    }
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
            <Options
              options={currentOptions}
              prevGuesses={guesses.previous}
              handleGuessChange={handleGuessChange}
              disabled={toggleOptions}
            />
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