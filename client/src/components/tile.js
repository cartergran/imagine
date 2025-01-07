import { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { Transition } from 'react-transition-group';
import config from '../config';

const StyledTile = styled.div`
  width: 100px;
  height: 100px;

  border: 1px solid white;
  transition: scale 0.4s;

  &.mistake {
    border: 1px solid red;
  }
`;

const transitionStyles = {
  entering: 1,
  entered: 1,
  exiting: 0,
  exited: 0,
};

const StyledImage = styled.div`
  width: 100%;
  height: 100%;

  background: url("data:image/png;base64,${props => props.$img || ''}");
  background-size: contain;

  transition: opacity ${props => props.$duration || 300}ms ease-in-out 0s;
  opacity: ${props => props.$opacity || 0};
`;

export default function Tile({ loc, state, onClick }) {
  const [clicked, setClicked] = useState(false);
  const [mistake, setMistake] = useState(false);
  const [img, setImg] = useState('');
  const nodeRef = useRef(null);

  useEffect(() => {
    if (state.attempts === config.attempts || state.correct) { return; }
    setMistake(true);
    setTimeout(() => setMistake(false), config.duration);
  }, [state.correct, state.attempts])

  const getImg = async (r, c) => {
    try {
      let res = await axios.get(process.env.REACT_APP_GET_TILE_URL, { params: { r, c }});
      setImg(res.data);
    } catch (err) {
      console.log('getImg() Error!', err.message);
    }
  };

  const handleClick = (e) => {
    if (state.solvable || clicked) { return; }
    setClicked(true);
    onClick((prevState) => { return { ...prevState, solvable: true }});
    let [r, c] = loc;
    getImg(r, c);
  };

  return (
    <StyledTile className={mistake ? 'mistake' : ''} $clicked={clicked} onClick={handleClick}>
      <Transition nodeRef={nodeRef} in={img !== ''} timeout={config.duration}>
        {state => (
          <StyledImage
            ref={nodeRef}
            $img={img}
            $duration={config.duration}
            $opacity={transitionStyles[state]}
          />
        )}
      </Transition>
    </StyledTile>
  );
}