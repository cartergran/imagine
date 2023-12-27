import { useState, useRef } from "react";
import styled from "styled-components";
import axios from "axios";
import { Transition } from "react-transition-group";

const StyledTile = styled.div`
  width: 100px;
  height: 100px;

  border: 1px solid white;
`;

const duration = 800;

const transitionStyles = {
  entering: 1,
  entered: 1,
  exiting: 0,
  exited: 0,
};

const StyledImage = styled.div`
  width: 100%;
  height: 100%;

  background: url('data:image/png;base64,${props => props.$img || ''}');
  background-size: contain;

  transition: opacity ${props => props.$duration || 300}ms ease-in-out 0s;
  opacity: ${props => props.$opacity || 0};
`;

export default function Tile({ loc }) {
  const [img, setImg] = useState("");
  const nodeRef = useRef(null);

  let getImg = async (r, c) => {
    try {
      let res = await axios.get(process.env.REACT_APP_TILE_URL, { params: { r, c }});
      setImg(res.data);
    } catch (err) {
      console.log("getImg() Error!", err.message);
    }
  };

  let handleClick = (e) => {
    let [r, c] = loc;
    getImg(r, c);
  };

  return (
    <StyledTile onClick={handleClick}>
      <Transition nodeRef={nodeRef} in={img !== ""} timeout={duration}>
        {state => (
          <StyledImage
            ref={nodeRef}
            $img={img}
            $duration={duration}
            $opacity={transitionStyles[state]}
          />
        )}
      </Transition>
    </StyledTile>
  );
}