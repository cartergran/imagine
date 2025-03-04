import { useCallback, useContext, useEffect, useState } from 'react';
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
  // const onMount = useRef(true);

  const toggleTileClick = clicked || toggle.maxSelection || buzzer;

  const getTileImg = async (r, c) => {
    let tileImgRes = { data: '' };
    try {
      tileImgRes = await axios.get('tile', { params: { r, c }});
    } catch (err) {
      console.log('getTileImg() Error!', err.message);
    }
    return tileImgRes.data;
  };

  const remixTile = useCallback(() => {
    let [r, c] = loc;
    getTileImg(r, c).then((tileImgRes) => {
      setTileImg(tileImgRes);
      setClicked(true);
      onClick((clicksLeft) => clicksLeft - 1);
    });
  }, [loc, onClick]);

  const handleClick = () => {
    if (toggleTileClick) { return; }
    remixTile();
  };

  useEffect(() => {
    if (!buzzer) { return; }
    let [r] = loc;
    let time = ((r * config.board.cols) + config.board.cols) * process.env.REACT_APP_MAGIC_NUM;
    let timer = setTimeout(remixTile, time);
    return () => clearTimeout(timer);
  }, [buzzer, loc, remixTile]);

  // useEffect(() => {
  //   if (onMount.current) { onMount.current = false; }
  // }, []);

  const getBorderColor = () => {
    // incorrect solution on attempt
    if (correctCategory && feedback) {
      return 'yellow';
    }

    // incorrect category on attempt
    if (feedback) {
      return 'red'
    }

    // preview || selection
    return toggle.maxSelection ? 'black' : 'white';
  };

  useEffect(() => {
    if (toggle.numAttempts === config.selectionsPerAttempt) { return; }
    setFeedback(true);
    let timer = setTimeout(() => setFeedback(false), config.duration);
    return () => clearTimeout(timer);
  }, [toggle.numAttempts]);

  return (
    <StyledTile onClick={handleClick}>
      <Flip borderColor={getBorderColor()} isFlipped={clicked}>
        <StyledTileImage $tileImg={tileImg} />
      </Flip>
    </StyledTile>
  );
}