import styled from "styled-components";

const StyledScore = styled.div`
  ${({ theme }) => theme.recycle.flexCenter};

  #score {
    height: 100px;

    ${({ theme }) => theme.recycle.flexCenter};
    gap: 8px;

    & span {
      display: inline-block;

      width: 12px;
      height: 4px;

      border-radius: 25%;
      background-color: white;
    }
  }
`;

export default function Score({ numGuesses }) {

  return (
    <StyledScore>
      <div id="score">
        { Array(numGuesses).fill(0).map((_, i) => <span key={i} />) }
      </div>
    </StyledScore>
  );
}