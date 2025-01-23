import { useEffect, useState } from 'react';
import styled from 'styled-components';
import scorecard from '../utils/scorecard';

const StyledScore = styled.dl`
  display: flex;
  flex-direction: column;
  align-items: center;

  dt {
    display: inline-flex;

    span {
      width: 23px;
      height: 23px;

      ${({ theme }) => theme.recycle.flexCenter};

      font-size: 23px;
    }
  }
}
`;

export default function Scorecard() {
  const [score, setScore] = useState([]);

  useEffect(() => {
    scorecard.init();
    setScore(scorecard.score);
  }, []);

  return (
    <div>
      <h5>{scorecard.title}</h5>
      <StyledScore>
        {
          score.map((row, i) => {
            return (
              <div key={i} className="share-row">
                <dd aria-label={`row ${i} intel`} />
                <dt>
                  { row.map((tile, j) => <span key={j} className="share-tile">{tile}</span>) }
                </dt>
              </div>
            );
          })
        }
      </StyledScore>
    </div>
  );
}