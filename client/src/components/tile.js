import styled from "styled-components";

const StyledTile = styled.div`
  width: 100px;
  height: 100px;

  border: 1px solid white;
`;

export default function Tile({ loc }) {

  let handleClick = (e) => {
    console.log(e.target);
  };

  return (
    <StyledTile onClick={handleClick}>
      <div loc={loc}></div>
    </StyledTile>
  );
}