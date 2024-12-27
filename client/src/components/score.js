import styled from 'styled-components';

const StyledScore = styled.div`
  ${({ theme }) => theme.recycle.flexCenter};

  margin-top: var(--space-l);

  #score {
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

export default function Score({ attempts }) {

  return (
    <StyledScore>
      <div id="score">
        { Array(attempts).fill(0).map((_, i) => <span className="dash" key={i} />) }
      </div>
    </StyledScore>
  );
}