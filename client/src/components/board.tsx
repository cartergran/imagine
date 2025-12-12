import { memo, useMemo, useCallback, useContext, useEffect, useRef } from 'react';
import styled from 'styled-components';

import Tile from './tile';

import config from '../utils/config';
import { SolvableContext, TilesPropsMap } from '../App';

interface BoardProps {
  attemptsLeft: number;
  restoredTiles: TilesPropsMap;
  maxSelection: boolean;
  onSelection: (selectionsLeft: number) => void;
}

interface TileWrapperProps {
  r: number;
  c: number;
  attemptsLeft: number;
  restoredTiles: TilesPropsMap;
  maxSelection: boolean;
  onClick: () => void;
}

const StyledBoard = styled.div<{ $rows: number; $cols: number }>`
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

const TileWrapper = memo(({
  r,
  c,
  attemptsLeft,
  maxSelection,
  restoredTiles,
  onClick,
}: TileWrapperProps) => {
  const loc = useMemo(() => ({ r, c }), [r, c]);
  const tileKey = `${r}:${c}`;
  const restoredTileState = restoredTiles?.get(tileKey);
  const restoredAttempt = restoredTileState?.attempt;
  const restoredBorderColor = restoredTileState?.color;
  return <Tile
    loc={loc}
    attemptsLeft={attemptsLeft}
    maxSelection={maxSelection}
    restoredAttempt={restoredAttempt}
    restoredBorderColor={restoredBorderColor}
    onClick={onClick}
  />;
});
TileWrapper.displayName = 'TileWrapper';

function Board({ attemptsLeft, restoredTiles, maxSelection, onSelection }: BoardProps) {
  const selectionsLeft = useRef(config.selectionsPerAttempt);
  const solvable = useContext(SolvableContext);

  useEffect(() => {
    if (!solvable) {
      selectionsLeft.current = config.selectionsPerAttempt;
    }
  }, [solvable]);

  const handleTileClick = useCallback(() => {
    const newSelectionsLeft = --selectionsLeft.current;
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
                      restoredTiles={restoredTiles}
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
