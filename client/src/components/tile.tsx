import axios from 'axios';
import { memo, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';

import Flip from './flip';

import config from '../utils/config';
import { PuzzleContext } from '../App';

interface TileProps {
  loc: { r: number; c: number };
  attemptsLeft: number;
  maxSelection: boolean;
  restoredAttempt?: number;
  restoredBorderColor?: string;
  onClick: (callback: (clicksLeft: number) => number) => void;
}

interface TileState {
  clicked: boolean;
  img: string;
}

const StyledTile = styled.div`
  width: var(--tile-size);
  height: var(--tile-size);
`;

const StyledTileImage = styled.div<{ $tileImg: string }>`
  width: 100%;
  height: 100%;

  background: url("${props => props.$tileImg || ''}");
  background-size: contain;
`;

const feedbackDuration = config.duration * (Number(import.meta.env.VITE_MAGIC_NUM) / 10);
const feedbackColors = {
  incorrect: 'red',
  correctCategory: 'yellow',
  correctSolution: 'green'
};

const getFeedbackColor = (correctCategory: boolean, correctSolution: boolean): string => {
  if (correctSolution) { return feedbackColors.correctSolution; }
  if (correctCategory) { return feedbackColors.correctCategory; }

  return feedbackColors.incorrect;
};

function Tile({ loc, attemptsLeft, maxSelection, restoredAttempt, restoredBorderColor, onClick }: TileProps) {
  // tileState.clicked := clicked
  // tileState.img := clicked || flipped
  const [tileState, setTileState] = useState<TileState>({ clicked: false, img: '' });
  const [imgReady, setImgReady] = useState(false);
  const [feedback, setFeedback] = useState(false);

  const imageRef = useRef<HTMLDivElement>(null);
  const reviewColor = useRef<string | null>(null);
  const hasLoadedImgRef = useRef(false);

  const { correctCategory, correctSolution, buzzer } = useContext(PuzzleContext);

  const toggleTileClick = feedback || tileState.clicked || maxSelection || buzzer;
  const borderWidth = buzzer && tileState.clicked ? '2' : '1';

  // memoize for borderColor, depends on context values that change less frequently
  const feedbackColor = useMemo(() =>
    getFeedbackColor(correctCategory, correctSolution),
    [correctCategory, correctSolution]
  );

  // memoize bc for borderStyle, feedbackColor is stable
  const borderColor = useMemo(() => {
    if (buzzer) {
      // restored
      if (tileState.clicked && reviewColor.current) {
        return reviewColor.current;
      }

      // correct during solve (edge case)
      if (tileState.clicked && correctSolution) {
        return feedbackColor;
      }

      return 'white';
    }

    if (feedback) { return feedbackColor }

    // preview || selection
    return (tileState.clicked || maxSelection) ? 'black' : 'white';
  }, [buzzer, correctSolution, feedback, feedbackColor, maxSelection, tileState.clicked]);

  const borderStyle = useMemo(() => ({
    color: borderColor,
    width: borderWidth
  }), [borderColor, borderWidth]);

  const getTileImg = async (attempt: number, r: number, c: number): Promise<string> => {
    let tileImgRes = { data: '' };
    try {
      tileImgRes = await axios.get<string>('/puzzle/tile', { params: { attempt, r, c }});
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('getTileImg() Error!', errorMessage);
    }
    return tileImgRes.data;
  };

  const remixTile = useCallback(() => {
    if (hasLoadedImgRef.current) { return; }

    if (!buzzer) { onClick((clicksLeft) => clicksLeft - 1); }

    // attempt [0 - 4]
    let attempt: number;
    if (buzzer) {
      attempt = restoredAttempt !== undefined ? restoredAttempt : config.totalAttempts - 1;
    } else {
      attempt = config.totalAttempts - attemptsLeft;
    }
    const { r, c } = loc;

    getTileImg(attempt, r, c).then((tileImgRes) => {
      if (!hasLoadedImgRef.current && tileImgRes) {
          hasLoadedImgRef.current = true;
          setTileState((prev) => ({
            clicked: buzzer ? prev.clicked : true,
            img: tileImgRes
          }));
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
  }, [attemptsLeft, buzzer, loc, onClick, restoredAttempt]);

  const handleClick = useCallback(() => {
    if (toggleTileClick) { return; }
    remixTile();
  }, [toggleTileClick, remixTile]);

  // initialize restored state
  useEffect(() => {
    if (!buzzer || !restoredBorderColor) { return; }

    setTileState(prev => ({ ...prev, clicked: true }));
    reviewColor.current = restoredBorderColor;
  }, [buzzer, restoredBorderColor]);

  useEffect(() => {
    if (!buzzer) { return; }

    const { r, c } = loc;
    const time = ((r * config.board.cols) + c) * Number(import.meta.env.VITE_MAGIC_NUM);
    const timer = setTimeout(remixTile, time);
    return () => clearTimeout(timer);
  }, [buzzer, loc, remixTile]);

  useEffect(() => {
    if (attemptsLeft === config.totalAttempts) { return; }

    setFeedback(true);
    const timer = setTimeout(() => setFeedback(false), feedbackDuration);
    return () => clearTimeout(timer);
  }, [attemptsLeft]);

  useEffect(() => {
    const needsReviewColor = tileState.clicked && !reviewColor.current;
    if ((feedback || buzzer) && needsReviewColor) {
      reviewColor.current = feedbackColor;
    }
  }, [buzzer, feedback, feedbackColor, tileState.clicked]);

  return (
    <StyledTile onClick={handleClick} data-testid="tile">
      <Flip
        borderStyle={borderStyle}
        isFlipped={imgReady && Boolean(tileState.img)}
      >
        <StyledTileImage ref={imageRef} $tileImg={tileState.img} data-testid="tile-img" />
      </Flip>
    </StyledTile>
  );
}

// Tile.whyDidYouRender = true;
export default memo(Tile);
