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

  const checkCorrect = async (guess) => {
    let correct = false;
    try {
      let res = await axios.get(process.env.REACT_APP_BASE_URL + '/check', { params: { guess }});
      correct = res.data;
    } catch (err) {
      console.log('checkCorrect() Error!', err.message);
    }
    return correct;
  };

  // TODO: is an async handler 'bad practice'?
  const handleSubmit = async (e) => {
    let correct = await checkCorrect(currentGuess);
    onSubmit((prevState) => {
      return {
        correct,
        solvable: false,
        attempts: --prevState.attempts
    }});
    setPrevGuesses((prevGuesses) => [...prevGuesses, currentGuess]);
    setCurrentGuess('');
  };

  useEffect(() => {
    // solvable && setTimeout(() => focus ? );
  }, [solvable]);

  return (
    <StyledSolve duration={config.duration}>
      <div id="solve">
        <Options
          options={config.categories}
          disabled={!solvable}
          prevGuesses={prevGuesses}
          setCurrentGuess={setCurrentGuess}
        />
        { solvable && <Button type="primary" onClick={handleSubmit}>Submit</Button> }
      </div>
    </StyledSolve>
  );
}