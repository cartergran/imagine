import styled from 'styled-components';

import Scorecard from './scorecard';
import Share from './share';

const StyledSummary = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-s);
`;

export default function Summary() {
  return (
    <StyledSummary>
      <Scorecard />
      <Share />
    </StyledSummary>
  );
};