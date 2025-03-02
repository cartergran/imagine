import { useContext, useEffect, useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import config from '../utils/config';

import { PuzzleContext } from '../App';
import Flip from './flip';

const StyledTile = styled.div`
  width: var(--tile-size);
  height: var(--tile-size);
`;

const StyledTileImage = styled.div`
  width: 100%;
  height: 100%;

  background: url("${props => props.$tileImg || ''}");
  background-size: contain;
`;

export default function Tile({ loc, toggle, onClick }) {
  const [clicked, setClicked] = useState(false);
  const [feedback, setFeedback] = useState(false);
  const [tileImg, setTileImg] = useState('');

  const { correctCategory, buzzer } = useContext(PuzzleContext);

  const toggleTileClick = clicked || toggle.solvable || buzzer;

  useEffect(() => {
    if (toggle.numAttempts === config.numAttempts) { return; } // on mount
    setFeedback(true);
    setTimeout(() => setFeedback(false), config.duration);
  }, [toggle.numAttempts]);

  const getTileImg = async (r, c) => {
    let tileImgRes = { data: '' };
    try {
      tileImgRes = await axios.get('tile', { params: { r, c }});
    } catch (err) {
      console.log('getTileImg() Error!', err.message);
    }
    return tileImgRes.data;
  };

  const handleClick = (e) => {
    if (toggleTileClick) { return; }
    let [r, c] = loc;
    getTileImg(r, c).then((tileImgRes) => {
      setTileImg(tileImgRes);
      setClicked(true);
      onClick((clicksLeft) => clicksLeft - 1);
    });
  };

  const getBorderColor = () => {
    // incorrect solution on attempt
    if (correctCategory && feedback) {
      return 'yellow';
    }

    // incorrect category on attempt
    if (feedback) {
      return 'red'
    }

    // initial flip || unselected
    return toggle.solvable ? 'black' : 'white';
  };

  return (
    <StyledTile onClick={handleClick}>
      <Flip borderColor={getBorderColor()} isFlipped={clicked}>
        <StyledTileImage $tileImg={tileImg} />
      </Flip>
    </StyledTile>
  );
}