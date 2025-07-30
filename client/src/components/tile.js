import { memo, useCallback, useContext, useEffect, useState } from 'react';
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

export default memo(function Tile({ loc, attemptsLeft, maxSelection, onClick }) {
  const [clicked, setClicked] = useState(false);
  const [feedback, setFeedback] = useState(false);
  const [feedbackColor, setFeedbackColor] = useState('');
  const [tileImg, setTileImg] = useState('');
  const [flipped, setFlipped] = useState(false);

  const { correctCategory, correctSolution, buzzer } = useContext(PuzzleContext);
  // const onMount = useRef(true);

  const toggleTileClick = feedback || clicked || maxSelection || buzzer;

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
    let attempt = buzzer ? config.totalAttempts - 1 : config.totalAttempts - attemptsLeft;
    let { r, c } = loc;
    getTileImg(attempt, r, c).then((tileImgRes) => {
      if (!tileImg) { setTileImg(tileImgRes); }
    });
  }, [attemptsLeft, loc, onClick, buzzer, tileImg]);

  const handleClick = () => {
    if (toggleTileClick) { return; }
    remixTile();
  };

  useEffect(() => {
    if (!buzzer) { return; }

    let { r, c } = loc;
    let time = ((r * config.board.cols) + c) * process.env.REACT_APP_MAGIC_NUM;
    let timer = setTimeout(remixTile, time);
    return () => clearTimeout(timer);
  }, [buzzer, loc, remixTile]);

  // useEffect(() => {
  //   if (onMount.current) { onMount.current = false; }
  // }, []);

  const getFeedbackColor = useCallback(() => {
    if (correctSolution) { return feedbackColors.correctSolution; }
    if (correctCategory) { return feedbackColors.correctCategory; }

    return feedbackColors.incorrect;
  }, [correctCategory, correctSolution]);

  const getBorderColor = () => {
    if (buzzer) { return feedbackColor; }
    if (feedback) { return getFeedbackColor(); }

    // clicked ||  preview || selection
    return clicked || maxSelection ? 'black' : 'white';
  };

  useEffect(() => {
    if (attemptsLeft === config.totalAttempts) { return; }

    setFeedback(true);
    let timer = setTimeout(() => setFeedback(false), feedbackDuration);
    return () => clearTimeout(timer);
  }, [attemptsLeft]);

  useEffect(() => {
    let needsFeedbackColor = clicked && !feedbackColor;
    if ((feedback || buzzer) && needsFeedbackColor) {
      setFeedbackColor(getFeedbackColor());
    }
  }, [feedback, buzzer, clicked, feedbackColor, getFeedbackColor]);

  return (
    <StyledTile onClick={handleClick} data-testid="tile">
      <Flip borderColor={getBorderColor()} isFlipped={flipped}>
        <StyledTileImage $tileImg={tileImg} data-testid="tile-img" />
      </Flip>
    </StyledTile>
  );
});