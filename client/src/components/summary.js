import styled from 'styled-components';
import config from '../utils/config';

const StyledSummary = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-l);
`;

export default function Summary({ correct }) {
  return (
    <StyledSummary>
      <h2>{ correct ? config.msgs.correct : config.msgs.incorrect }</h2>
      {/* TODO: <Scorecard /> */}
      {/* TODO: <Share /> */}
    </StyledSummary>
  );
};