import styled from 'styled-components';
import config from '../config';

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

export default function Stats({ success }) {
  return (
    <StyledStats>
      <h2>{ success ? config.msgs.success : config.msgs.failure }</h2>
      <div id="stats">
        <div id="stats-title">{`${config.title} #${config.day}`}</div>
        <div id="stats-recap"></div>
      </div>
    </StyledStats>
  );
};