import styled from 'styled-components';
import config from '../utils/config';

const StyledStats = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-l);

  .stats {
    &-title {
      font-size: 20px;
    }
  }
`;

export default function Stats({ correct }) {
  return (
    <StyledStats>
      <h2>{ correct ? config.msgs.correct : config.msgs.incorrect }</h2>
      <div id="stats">
        <div id="stats-title">{`${config.title} #${config.day}`}</div>
        <div id="stats-recap"></div>
      </div>
    </StyledStats>
  );
};