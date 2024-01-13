import styled from "styled-components";

const StyledScore = styled.div`
  ${({ theme }) => theme.recycle.flexCenter};

  margin-top: 24px;

  #score {
    ${({ theme }) => theme.recycle.flexCenter};
    gap: 8px;

    & .dash {
      display: inline-block;

      width: 12px;
      height: 4px;

      border-radius: 25%;
      background-color: white;
    }
  }
`;

export default function Score({ guesses }) {

  return (
    <StyledScore>
      <div id="score">
        { Array(guesses).fill(0).map((_, i) => <span className="dash" key={i} />) }
      </div>
    </StyledScore>
  );
}