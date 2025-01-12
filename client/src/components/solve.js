import { Button } from 'antd';
import { useContext, useEffect, useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import config from '../config';

import { CategoryContext } from '../App'
import Options from './options';

const StyledSolve = styled.div`
  ${({ theme }) => theme.recycle.flexCenter};

  margin: 24px 0;

  #solve {
    ${({ theme }) => theme.recycle.flexCenter};
    flex-direction: column;
    gap: var(--space-m);
  }

  .ant-btn-primary {
    border-radius: var(--space-s);
    transition:
      background ${props => props.$duration || 2300}ms,
      border ${props => props.$duration || 2300}ms,
      color ${props => props.$duration || 2300}ms;

    // increase specificity to override antd
    &[disabled] {
      border: 1px solid var(--disabled);
      color: var(--disabled);
    }
  }
`;

export default function Solve({ solvable, onSubmit }) {
  const [currentGuess, setCurrentGuess] = useState('');
  const [prevGuesses, setPrevGuesses] = useState([]);
  const [choices, setChoices] = useState([]);

  const correctCategory = useContext(CategoryContext);

  const checkCorrect = async (guess, type) => {
    let correct = false;
    try {
      let res =
        await axios.get(process.env.REACT_APP_BASE_URL + `/check${type}`, { params: { guess }});
      correct = res.data;
      (type === 'Category' && correct) &&
        onSubmit((prevState) => { return {...prevState, correctCategory: correct }});
    } catch (err) {
      console.log('checkCorrect() Error!', err.message);
    }
    return correct;
  };

  const handleSubmit = async (e) => {
    let correctGuess  = await checkCorrect(currentGuess, correctCategory ? 'Solution' : 'Category');
    if (correctGuess) {
      onSubmit((prevState) => {
        return {
          ...prevState,
          correctCategory: correctGuess,
          correctSolution: correctCategory && correctGuess,
          solvable: true
      }});
      return;
    }

    onSubmit((prevState) => {
      return {
        ...prevState,
        attempts: --prevState.attempts,
        solvable: false
    }});

    setPrevGuesses((prevGuesses) => [...prevGuesses, currentGuess]);
    setCurrentGuess('');
  };

  useEffect(() => {
    // solvable && buttonRef.focus();
  }, [solvable]);

  useEffect(() => {
    const getChoices = async () => {
      let choices = await axios.get(process.env.REACT_APP_BASE_URL + '/choices');
      setChoices(choices.data);
    };
    correctCategory && getChoices();
  }, [correctCategory]);

  return (
    <StyledSolve $duration={config.duration}>
      <div id="solve">
        <Options
          options={correctCategory ? choices : config.categories}
          correctCategory={correctCategory}
          prevGuesses={prevGuesses}
          setCurrentGuess={setCurrentGuess}
          disabled={!solvable}
        />
        <Button type="primary" onClick={handleSubmit} disabled={!solvable}>Submit</Button>
      </div>
    </StyledSolve>
  );
}