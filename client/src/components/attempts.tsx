import styled from 'styled-components';
import Text from 'antd/es/typography/Text';

import config from '../utils/config';

interface AttemptsProps {
  count: number;
}

const StyledAttempts = styled.div`
  ${({ theme }) => theme.recycle.flexCenter};

  margin-top: var(--space-l);

  #attempts {
    ${({ theme }) => theme.recycle.flexCenter};
    gap: var(--space-s);

    & .attempt-circle {
      width: 12px;
      height: 12px;

      display: inline-block;

      border-radius: 50%;
      background-color: white;
    }
  }
`;

const AttemptsLabel = styled(Text)`
  color: white;
  margin-right: var(--space-s);
`;

export default function Attempts({ count }: AttemptsProps) {
  return (
    <StyledAttempts>
      <AttemptsLabel>{config.labels.attemptsLeft}</AttemptsLabel>
      <div id="attempts">
        { Array(count).fill(0).map((_, i) => <span className="attempt-circle" key={i} />) }
      </div>
    </StyledAttempts>
  );
}
