import styled from 'styled-components';

import Scorecard from './scorecard';

const StyledSummary = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-l);
`;

export default function Summary() {
  return (
    <StyledSummary>
      <Scorecard />
      {/* TODO: <Share /> */}
    </StyledSummary>
  );
};