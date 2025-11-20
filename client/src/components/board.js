import { memo, useMemo, useCallback, useContext, useEffect, useRef } from 'react';
import styled from 'styled-components';
import config from '../utils/config';

import { SolvableContext } from '../App';
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

const TileWrapper = memo(({ r, c, attemptsLeft, clickedTiles, maxSelection, onClick }) => {
  const loc = useMemo(() => ({ r, c }), [r, c]);
  const tileKey = `${r}:${c}`;
  const tileData = clickedTiles?.get(tileKey);
  const restoredAttempt = tileData?.attempt;
  const restoredBorderColor = tileData?.color;
  return <Tile
    loc={loc}
    attemptsLeft={attemptsLeft}
    maxSelection={maxSelection}
    restoredAttempt={restoredAttempt}
    restoredBorderColor={restoredBorderColor}
    onClick={onClick}
  />;
});

function Board({ attemptsLeft, clickedTiles, maxSelection, onSelection }) {
  const selectionsLeft = useRef(config.selectionsPerAttempt);
  const solvable = useContext(SolvableContext);

  useEffect(() => {
    if (!solvable) {
      selectionsLeft.current = config.selectionsPerAttempt;
    }
  }, [solvable]);

  const handleTileClick = useCallback(() => {
    let newSelectionsLeft = --selectionsLeft.current;
    if (newSelectionsLeft === 0) {
      onSelection(newSelectionsLeft);
    }
  }, [onSelection]);

  return (
    <StyledBoard $rows={config.board.rows} $cols={config.board.cols}>
      <div id="board">
        {
          Array.from({ length: config.board.rows }).map((_,  r) => (
            <div key={r} className="row">
              {
                Array.from({ length: config.board.cols }).map((_, c) => {
                  return (
                    <TileWrapper
                      key={`${r}${c}`}
                      r={r}
                      c={c}
                      attemptsLeft={attemptsLeft}
                      clickedTiles={clickedTiles}
                      maxSelection={maxSelection}
                      onClick={handleTileClick}
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

// Board.whyDidYouRender = true;
export default memo(Board);
