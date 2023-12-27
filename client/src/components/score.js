import { useEffect, useState } from "react";
import styled from "styled-components";

const StyledScore = styled.div`
  ${({ theme }) => theme.recycle.flexCenter};

  #score {
    height: 100px;

    ${({ theme }) => theme.recycle.flexCenter};
    gap: 8px;

    & > span {
      display: inline-block;

      width: 12px;
      height: 4px;

      border-radius: 25%;
      background-color: white;
    }
  }
`;

export default function Score({ numGuesses }) {
  const [score, setScore] = useState([]);

  useEffect(() => {
    let initScore = () => {
      let res = [];
      for (let i = 0; i < numGuesses; i++) {
        res.push(<span key={i}></span>);
      }
      setScore(res);
    };
    initScore();
  });

  return (
    <StyledScore>
      <div id="score">
        { score }
      </div>
    </StyledScore>
  );
}