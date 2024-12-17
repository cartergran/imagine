import { Button } from 'antd';
import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { duration } from '../config';

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
  }
`;

export default function Solve({ active, onSubmit }) {
  const [guess, setGuess] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: if (checkCorrect(guess)) else
    onSubmit((prevState) => { return { solvable: false, guesses: --prevState.guesses }});
    setGuess('');
  };

  useEffect(() => {
    // active && setTimeout(() => focus ? );
  }, [active]);

  return (
    <StyledSolve>
      <div id="solve">
        <Solutions disabled={!active} />
        { active && <Button type="primary" onClick={handleSubmit}>Submit</Button> }
      </div>
    </StyledSolve>
  );
}