import { useContext, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { Transition } from 'react-transition-group';
import config from '../config';

import { CategoryContext } from '../App';

const StyledTile = styled.div`
  width: 100px;
  height: 100px;

  border: 1px solid white;
  // TODO: transition: scale ?

  &.incorrect-cat {
    border-color: red;
  }
  &.incorrect-sol {
    border-color: yellow;
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

  transition: opacity ${props => props.$duration || 2300}ms ease-in-out 0s;
  opacity: ${props => props.$opacity || 0};
`;

export default function Tile({ loc, state, onClick }) {
  const [clicked, setClicked] = useState(false);
  const [incorrect, setIncorrect] = useState(false);
  const [img, setImg] = useState('');

  const nodeRef = useRef(null);
  const correctCategory = useContext(CategoryContext);

  useEffect(() => {
    if (state.attempts === config.attempts || state.correct) { return; }
    setIncorrect(true);
    setTimeout(() => setIncorrect(false), config.duration);
  }, [state.correct, state.attempts])

  const getImg = async (r, c) => {
    try {
      let res = await axios.get(process.env.REACT_APP_BASE_URL + '/tile', { params: { r, c }});
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

  const getClassName = () => {
    return correctCategory && incorrect ? 'incorrect-sol' : (incorrect ? 'incorrect-cat' : '');
  };

  return (
    <StyledTile className={getClassName()} $clicked={clicked} onClick={handleClick}>
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