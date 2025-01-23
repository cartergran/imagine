import { useContext, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { Transition } from 'react-transition-group';
import config from '../utils/config';

import { CategoryContext } from '../App';

const StyledTile = styled.div`
  width: 100px;
  height: 100px;

  border: 2px solid white;
  transition: border ${props => props.$duration || 2300}ms;

  &.preview {
    border-color: black;
  }
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

const StyledTileImage = styled.div`
  width: 100%;
  height: 100%;

  background: url("data:image/png;base64,${props => props.$tileImg || ''}");
  background-size: contain;

  transition: opacity ${props => props.$duration || 2300}ms ease-in-out 0s;
  opacity: ${props => props.$opacity || 0};
`;

export default function Tile({ loc, toggle, onClick }) {
  const [clicked, setClicked] = useState(false);
  const [feedback, setFeedback] = useState(false);
  const [tileImg, setTileImg] = useState('');

  const nodeRef = useRef(null);
  const correctCategory = useContext(CategoryContext);

  useEffect(() => {
    if (toggle.attempts === config.attempts) { return; } // on mount
    setFeedback(true);
    setTimeout(() => setFeedback(false), config.duration);
  }, [toggle.attempts])

  const getTileImg = async (r, c) => {
    try {
      let res = await axios.get(process.env.REACT_APP_BASE_URL + '/tile', { params: { r, c }});
      setTileImg(res.data);
    } catch (err) {
      console.log('getTileImg() Error!', err.message);
    }
  };

  const handleClick = (e) => {
    if (toggle.solvable || clicked) { return; }
    setClicked(true);
    onClick((prevState) => { return { ...prevState, solvable: true }});
    let [r, c] = loc;
    getTileImg(r, c);
  };

  const getClassName = () => {
    if (correctCategory && feedback) {
      return 'incorrect-sol';
    }

    if (feedback) {
      return 'incorrect-cat'
    }

    return toggle.solvable ? 'preview' : '';
  };

  return (
    <StyledTile className={getClassName()} $clicked={clicked} onClick={handleClick}>
      <Transition nodeRef={nodeRef} in={tileImg !== ''} timeout={config.duration}>
        {phase => (
          <StyledTileImage
            ref={nodeRef}
            $tileImg={tileImg}
            $duration={config.duration}
            $opacity={transitionStyles[phase]}
          />
        )}
      </Transition>
    </StyledTile>
  );
}