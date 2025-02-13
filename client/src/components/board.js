import { useEffect, useState } from 'react';
import styled from 'styled-components';
import config from '../utils/config';

import Tile from './tile';

const StyledBoard = styled.div`
  ${({ theme }) => theme.recycle.flexCenter};

  margin-top: var(--space-l);

  #board {
    display: grid;
    grid-template-rows: repeat(${props => props.$rows || 4}, 1fr);
    gap: var(--space-s);
  }

  .row {
    // create own flex context inside grid cell
    display: flex;
    gap: var(--space-s);
  }
`;

export default function Board({ toggle, onEndSelection }) {
  const [clicksLeft, setClicksLeft] = useState(config.clicksPerAttempt);

  useEffect(() => {
    if (clicksLeft === 0) {
      onEndSelection((prevState) => { return { ...prevState, solvable: true }});
    }
  }, [clicksLeft, onEndSelection]);

  useEffect(() => {
    if (!toggle.solvable) {
      setClicksLeft(config.clicksPerAttempt);
    }
  }, [toggle.solvable]);

  return (
    <StyledBoard $rows={config.board.rows} $cols={config.board.cols}>
      <div id="board">
        {
          Array.from({ length: config.board.rows }).map((_,  r) => (
            <div key={r} className="row">
              {
                Array.from({ length: config.board.cols }).map((_, c) => {
                  return (
                    <Tile
                      key={`${r}${c}`}
                      loc={`${r}${c}`}
                      toggle={toggle}
                      onClick={setClicksLeft}
                    />
                  );
                })
              }
            </div>
          ))
        }
      </div>
    </StyledBoard>
  );
}