import { Button } from 'antd';
import { useEffect, useState } from 'react';
import styled from 'styled-components';

import Solutions from './solutions';

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
    animation: fade-in 1s;
  }
`;

export default function Solve({ solvable, onSubmit }) {
  const [currentGuess, setCurrentGuess] = useState('');
  const [prevGuesses, setPrevGuesses] = useState([]);

  const handleSubmit = (e) => {
    // TODO: if (checkCorrect(guess)) else
    onSubmit((prevState) => { return { solvable: false, attempts: --prevState.attempts }});
    setPrevGuesses((prevGuesses) => [...prevGuesses, currentGuess]);
    setCurrentGuess('');
  };

  useEffect(() => {
    // solvable && setTimeout(() => focus ? );
  }, [solvable]);

  return (
    <StyledSolve>
      <div id="solve">
        <Solutions
          disabled={!solvable}
          prevGuesses={prevGuesses}
          setCurrentGuess={setCurrentGuess}
        />
        { solvable && <Button type="primary" onClick={handleSubmit}>Submit</Button> }
      </div>
    </StyledSolve>
  );
}