import { useContext, useEffect, useState } from 'react';
import styled from 'styled-components';
import config from '../utils/config';

import { PuzzleContext } from '../App';
import Tile from './tile';

const StyledBoard = styled.div`
  ${({ theme }) => theme?.recycle?.flexCenter};

  margin-top: var(--space-l);

  #board {
    display: grid;
    grid-template-rows: repeat(${props => props.$rows || 4}, 1fr);
    gap: var(--space-xs);
  }

  .row {
    // create own flex context inside grid cell
    display: flex;
    gap: var(--space-xs);
  }
`;

export default function Board({ toggle, onSelection }) {
  const [selectionsLeft, setSelectionsLeft] = useState(config.selectionsPerAttempt);

  const { solvable } = useContext(PuzzleContext);

  useEffect(() => {
    if (selectionsLeft === config.selectionsPerAttempt - 1) {
      onSelection((prevState) => { return { ...prevState, solvable: true }});
    } else if (selectionsLeft === 0) {
      onSelection((prevState) => { return { ...prevState, maxSelection: true }});
    }
  }, [selectionsLeft, onSelection]);

  useEffect(() => {
    if (!solvable) {
      setSelectionsLeft(config.selectionsPerAttempt);
    }
  }, [solvable]);

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
                      loc={{r, c}}
                      toggle={toggle}
                      onClick={setSelectionsLeft}
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