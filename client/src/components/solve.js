import { Button } from 'antd';
import { useContext, useEffect, useRef, useState } from 'react';
import { CSSTransition } from 'react-transition-group';
import styled from 'styled-components';
import axios from 'axios';
import config from '../utils/config';

import { PuzzleContext, SolvableContext } from '../App';
import Options from './options';

const StyledSolve = styled.div`
  ${({ theme }) => theme.recycle.flexCenter};

  margin-top: var(--space-l);

  #solve {
    ${({ theme }) => theme.recycle.flexCenter};
    flex-direction: column;
    gap: var(--space-m);
  }

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

// fisher-yates shuffle
const shuffleArray = (arr) => {
  for (let i = arr.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1)); // random index
    [arr[i], arr[j]] = [arr[j], arr[i]]; // swap elements
  }
  return arr;
}

export default function Solve({ onSubmit }) {
  const [currentGuess, setCurrentGuess] = useState('');
  const [prevGuesses, setPrevGuesses] = useState([]);
  const [currentOptions, setCurrentOptions] = useState([]);
  const [transitionOptions, setTransitionOptions] = useState(true);

  const { correctCategory, buzzer } = useContext(PuzzleContext);
  const solvable = useContext(SolvableContext);
  const optionsRef = useRef(null);

  const toggleOptions = !solvable || buzzer;
  const toggleSubmit = !solvable || !currentGuess || buzzer;

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
    const getChoices = async () => {
      let choicesRes = await axios.get('choices');
      let choices = shuffleArray(choicesRes.data);
      setTimeout(() => {
        setCurrentOptions(choices);
        setTransitionOptions(true);
      }, config.duration);
    };
    setTransitionOptions(false);
    getChoices();
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
    let correctGuess  = await checkCorrect(currentGuess, correctCategory ? 'solution' : 'category');
    if (correctGuess) {
      onSubmit((prevState) => ({
        ...prevState,
        correctCategory: correctGuess,
        correctSolution: correctCategory && correctGuess,
        solvable: true
      }));
      setPrevGuesses([]);
    } else {
      onSubmit((prevState) => ({
        ...prevState,
        attemptsLeft: --prevState.attemptsLeft,
        solvable: false,
        maxSelection: false
      }));
      setPrevGuesses((prevGuesses) => [...prevGuesses, currentGuess]);
    }

    setCurrentGuess('');
  };

  return (
    <StyledSolve>
      <div id="solve">
        <CSSTransition
          in={transitionOptions}
          nodeRef={optionsRef}
          timeout={config.duration}
          classNames="fade"
        >
          <Options
            ref={optionsRef}
            options={currentOptions}
            prevGuesses={prevGuesses}
            setCurrentGuess={setCurrentGuess}
            disabled={toggleOptions}
          />
        </CSSTransition>
        <Button
          type="primary"
          onClick={handleSubmit}
          disabled={toggleSubmit}
        >
          { config.actions.submit }
        </Button>
      </div>
    </StyledSolve>
  );
}