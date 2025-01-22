import styled from 'styled-components';
import config from '../utils/config';

import Scorecard from './scorecard';

const StyledSummary = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-l);
`;

export default function Summary({ correct }) {
  return (
    <StyledSummary>
      <h1>{ correct ? config.msgs.correct : config.msgs.incorrect }</h1>
      <Scorecard />
      {/* TODO: <Share /> */}
    </StyledSummary>
  );
};