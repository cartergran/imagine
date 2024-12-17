import styled from 'styled-components';
import { title, day, msgs } from '../config';

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
      <h2>{ success ? msgs.success : msgs.failure }</h2>
      <div id="stats">
        <div id="stats-title">{`${title} #${day}`}</div>
        <div id="stats-recap"></div>
      </div>
    </StyledStats>
  );
};