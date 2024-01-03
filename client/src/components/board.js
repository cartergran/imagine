import { useEffect, useState } from "react";
import styled from "styled-components";
import Tile from "./tile";

const StyledBoard = styled.div`
  ${({ theme }) => theme.recycle.flexCenter};

  #board {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    grid-template-rows: repeat(4, 1fr);
    gap: 8px;
  }
`;

export default function Board({ numRows, numCols, onTileClick }) {
  const [board, setBoard] = useState([]);

  useEffect(() => {
    let initBoard = () => {
      let res = [];
      for (let i = 0; i < numRows; i++) {
        for (let j = 0; j < numCols; j++) {
          res.push(<Tile key={`${i}${j}`} loc={`${i}${j}`} onClick={onTileClick} />);
        }
      }
      setBoard(res);
    };

    initBoard();
  }, [numRows, numCols, onTileClick]);

  return (
    <StyledBoard>
      <div id="board">
        { board }
      </div>
    </StyledBoard>
  );
}