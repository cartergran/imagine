import { memo, useCallback, useContext, useEffect, useRef, useState } from 'react';
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
const getFeedbackColor = (correctCategory, correctSolution) => {
  if (correctSolution) { return feedbackColors.correctSolution; }
  if (correctCategory) { return feedbackColors.correctCategory; }

  return feedbackColors.incorrect;
};

function Tile({ loc, attemptsLeft, maxSelection, onClick }) {
  // tileState.clicked := clicked
  // tileState.img := clicked || flipped
  const [tileState, setTileState] = useState({ clicked: false, img: '' });
  const [imgReady, setImgReady] = useState(false);
  const [feedback, setFeedback] = useState(false);

  const imageRef = useRef(null);
  const reviewColor = useRef(null);
  // const preloadedImgRef = useRef(null);

  const { correctCategory, correctSolution, buzzer } = useContext(PuzzleContext);
  // const onMount = useRef(true);

  const toggleTileClick = feedback || tileState.clicked || maxSelection || buzzer;
  const feedbackColor = getFeedbackColor(correctCategory, correctSolution);
  const borderWidth = buzzer && tileState.clicked ? '2' : '1';

  const getBorderColor = () => {
    if (buzzer && tileState.clicked) { return reviewColor.current ?? feedbackColor }
    if (feedback) { return feedbackColor }

    // preview || selection
    return (tileState.clicked || maxSelection) ? 'black' : 'white';
  };

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
    if (!buzzer) { onClick((clicksLeft) => clicksLeft - 1); }

    // attempt [0 - 4]
    let attempt = buzzer ? config.totalAttempts - 1 : config.totalAttempts - attemptsLeft;
    let { r, c } = loc;
    // const tileImgPromise = preloadedImgRef.current
    //   ? Promise.resolve(preloadedImgRef.current)
    //   : getTileImg(attempt, r, c);

    getTileImg(attempt, r, c).then((tileImgRes) => {
      if (!tileState.img && tileImgRes) {
          setTileState({
            clicked: buzzer ? false : true,
            img: tileImgRes
          });
          requestAnimationFrame(() => {
            if (imageRef.current) {
              const computedStyle = window.getComputedStyle(imageRef.current);
              const backgroundImage = computedStyle.backgroundImage;
              if (backgroundImage && backgroundImage !== 'none') {
                setImgReady(true);
              }
            }
          });
      }
    });
  }, [attemptsLeft, loc, onClick, buzzer, tileState.img]);

  const handleClick = () => {
    if (toggleTileClick) { return; }
    remixTile();
  };

  // useEffect(() => {
  //   if (!buzzer) { return; }

  //   let attempt = config.totalAttempts - 1;
  //   let { r, c } = loc;
  //   getTileImg(attempt, r, c).then((tileImgRes) => {
  //     if (tileImgRes) {
  //       preloadedImgRef.current = tileImgRes;
  //     }
  //   });
  // }, [buzzer, loc]);

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

  useEffect(() => {
    if (attemptsLeft === config.totalAttempts) { return; }

    setFeedback(true);
    let timer = setTimeout(() => setFeedback(false), feedbackDuration);
    return () => clearTimeout(timer);
  }, [attemptsLeft]);

  useEffect(() => {
    let needsReviewColor = tileState.clicked && !reviewColor.current;
    if ((feedback || buzzer) && needsReviewColor) {
      reviewColor.current = feedbackColor;
    }
  }, [buzzer, feedback, feedbackColor, tileState.clicked]);

  return (
    <StyledTile onClick={handleClick} data-testid="tile">
      <Flip
        borderStyle={{ color: getBorderColor(), width: borderWidth }}
        isFlipped={imgReady && tileState.img}
      >
        <StyledTileImage ref={imageRef} $tileImg={tileState.img} data-testid="tile-img" />
      </Flip>
    </StyledTile>
  );
};

// Tile.whyDidYouRender = true;
export default memo(Tile);
