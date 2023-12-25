import { useState } from "react";
import styled from "styled-components";
import axios from "axios";

const StyledTile = styled.div`
  width: 100px;
  height: 100px;

  border: 1px solid white;
  background: url('data:image/png;base64,${props => props.$img || ''}');
  background-size: contain;
`;

export default function Tile({ loc }) {
  const [img, setImg] = useState("");

  let getImg = async (r, c) => {
    try {
      let res = await axios.get(process.env.REACT_APP_TILE_URL, { params: { r, c }});
      setImg(res.data);
    } catch (err) {
      console.log("getImg() Error!", err.message);
    }
  };

  let handleClick = (e) => {
    let [r, c] = e.target.children[0].getAttribute("loc").split("");
    getImg(r, c);
  };

  return (
    <StyledTile onClick={handleClick} $img={img}>
      <div loc={loc}></div>
    </StyledTile>
  );
}