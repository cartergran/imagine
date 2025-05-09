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

const feedbackDuration = config.duration * (process.env.REACT_APP_MAGIC_NUM / 10);
const feedbackColors = {
  incorrect: 'red',
  correctCategory: 'yellow',
  correctSolution: 'green'
};

export default function Tile({ loc, toggle, onClick }) {
  const [clicked, setClicked] = useState(false);
  const [feedback, setFeedback] = useState(false);
  const [feedbackColor, setFeedbackColor] = useState('');
  const [tileImg, setTileImg] = useState('');
  const [flipped, setFlipped] = useState(false);

  const { correctCategory, correctSolution, buzzer } = useContext(PuzzleContext);
  // const onMount = useRef(true);

  const toggleTileClick = feedback || clicked || toggle.maxSelection || buzzer;

  const getTileImg = async (attempt, r, c,) => {
    let tileImgRes = { data: '' };
    try {
      tileImgRes = await axios.get('tile', { params: { attempt, r, c }});
    } catch (err) {
      console.log('getTileImg() Error!', err.message);
    }
    return tileImgRes.data;
  };

  const remixTile = useCallback(() => {
    setFlipped(true);

    if (!buzzer) {
      setClicked(true);
      onClick((clicksLeft) => clicksLeft - 1);
    }

    // attempt [0 - 4]
    let attempt = buzzer ? config.numAttempts - 1 : config.numAttempts - toggle.numAttempts;
    let {r, c} = loc;
    getTileImg(attempt, r, c).then((tileImgRes) => {
      if (!tileImg) { setTileImg(tileImgRes); }
    });
  }, [toggle.numAttempts, loc, onClick, buzzer, tileImg]);

  const handleClick = () => {
    if (toggleTileClick) { return; }
    remixTile();
  };

  useEffect(() => {
    if (!buzzer) { return; }

    let time = ((loc.r * config.board.cols) + loc.c) * process.env.REACT_APP_MAGIC_NUM;
    let timer = setTimeout(remixTile, time);
    return () => clearTimeout(timer);
  }, [buzzer, loc, remixTile]);

  // useEffect(() => {
  //   if (onMount.current) { onMount.current = false; }
  // }, []);

  const getFeedbackColor = useCallback(() => {
    if (correctSolution) {
      return feedbackColors.correctSolution;
    }

    if (correctCategory) {
      return feedbackColors.correctCategory;
    }

    return feedbackColors.incorrect;
  }, [correctCategory, correctSolution]);

  const getBorderColor = () => {
    if (buzzer) {
      return feedbackColor;
    }

    if (feedback) {
      return getFeedbackColor();
    }

    // clicked ||  preview || selection
    return clicked || toggle.maxSelection ? 'black' : 'white';
  };

  useEffect(() => {
    if (toggle.numAttempts === config.numAttempts) { return; }

    setFeedback(true);
    let timer = setTimeout(() => setFeedback(false), feedbackDuration);
    return () => clearTimeout(timer);
  }, [toggle.numAttempts]);

  useEffect(() => {
    if ((feedback || buzzer) && clicked && !feedbackColor) {
      setFeedbackColor(getFeedbackColor());
    }
  }, [feedback, buzzer, clicked, feedbackColor, getFeedbackColor]);

  return (
    <StyledTile onClick={handleClick} data-testid="tile">
      <Flip borderColor={getBorderColor()} isFlipped={flipped}>
        <StyledTileImage $tileImg={tileImg} />
      </Flip>
    </StyledTile>
  );
}