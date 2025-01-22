import styled from 'styled-components';

const StyledAttempts = styled.div`
  ${({ theme }) => theme.recycle.flexCenter};

  margin-top: var(--space-l);

  #attempts {
    ${({ theme }) => theme.recycle.flexCenter};
    gap: var(--space-s);

    & .dash {
      display: inline-block;

      width: 12px;
      height: 4px;

      border-radius: 25%;
      background-color: white;
    }
  }
`;

export default function Attempts({ count }) {
  return (
    <StyledAttempts>
      <div id="attempts">
        { Array(count).fill(0).map((_, i) => <span className="dash" key={i} />) }
      </div>
    </StyledAttempts>
  );
}