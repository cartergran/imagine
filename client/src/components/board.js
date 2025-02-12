import { useEffect, useState } from 'react';
import styled from 'styled-components';
import config from '../utils/config';

import Tile from './tile';

const StyledBoard = styled.div`
  ${({ theme }) => theme.recycle.flexCenter};

  margin-top: var(--space-l);

  #board {
    display: grid;
    grid-template-columns: repeat(${props => props.$cols || 4}, 1fr);
    grid-template-rows: repeat(${props => props.$rows || 4}, 1fr);
    gap: var(--space-s);
  }
`;

export default function Board({ toggle, onTileClick }) {
  const [board, setBoard] = useState([]);

  useEffect(() => {
    let initBoard = () => {
      let res = [];
      for (let i = 0; i < config.board.rows; i++) {
        for (let j = 0; j < config.board.cols; j++) {
          res.push(
            <Tile key={`${i}${j}`} loc={`${i}${j}`} toggle={toggle} onClick={onTileClick} />
          );
        }
      }
      setBoard(res);
    };

    initBoard();
  }, [toggle, onTileClick]);

  return (
    <StyledBoard $rows={config.board.rows} $cols={config.board.cols}>
      <div id="board">
        { board }
      </div>
    </StyledBoard>
  );
}