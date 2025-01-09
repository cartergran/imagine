import { Button } from 'antd';
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import config from '../config';

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
    animation: fade-in ${props => props.$duration || 2300}ms;
  }
`;

export default function Solve({ solvable, onSubmit }) {
  const [currentGuess, setCurrentGuess] = useState('');
  const [prevGuesses, setPrevGuesses] = useState([]);
  const [correctCategory, setCorrectCategory] = useState(false);
  const [choices, setChoices] = useState([]);

  const checkCorrectCategory = async (guess) => {
    try {
      let res =
        await axios.get(process.env.REACT_APP_BASE_URL + '/checkCategory', { params: { guess }});
      setCorrectCategory(res.data);
    } catch (err) {
      console.log('checkCorrectCategory() Error!', err.message);
    }
  };

  const checkCorrectSolution = async (guess) => {
    let correct = false;
    try {
      let res =
        await axios.get(process.env.REACT_APP_BASE_URL + '/checkSolution', { params: { guess }});
      correct = res.data;
      } catch (err) {
        console.log('checkCorrectSolution() Error!', err.message);
      }
    return correct;
  };

  const handleSubmit = async (e) => {
    if (correctCategory) {
      let correct =  await checkCorrectSolution(currentGuess);
      onSubmit((prevState) => {
        return {
          correct,
          solvable: false,
          attempts: --prevState.attempts
      }});
    } else {
      await checkCorrectCategory(currentGuess);
      onSubmit((prevState) => {
        return {
          solvable: false,
          attempts: --prevState.attempts
      }});
    }

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
          disabled={!solvable}
          correctCategory={correctCategory}
          prevGuesses={prevGuesses}
          setCurrentGuess={setCurrentGuess}
        />
        { solvable && <Button type="primary" onClick={handleSubmit}>Submit</Button> }
      </div>
    </StyledSolve>
  );
}