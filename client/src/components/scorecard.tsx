import { useContext, useEffect, useState } from 'react';
import styled from 'styled-components';
import Text from 'antd/es/typography/Text';

import config from '../utils/config';
import { PuzzleContext } from '../lib/contexts';
import scorecard, { fetchPuzzleImg, fetchCategoryAndSolution } from '../utils/scorecard';

interface ScorecardProps {
  title?: string;
  card?: string[][];
  score?: number;
  puzzleImg?: string;
}

const StyledScorecard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;

  .scorecard-eval {
    display: flex;
    justify-content: center;
  }
`;

const ScorecardLabel = styled(Text)<{ $marginTop?: boolean }>`
  display: inline-flex;

  color: white;
  font-size: 12px;
  margin-top: ${props => props.$marginTop ? 'var(--space-s)' : '0'};
  text-align: center;
  white-space: pre-line;
`;

const StyledCard = styled.dl`
  width: calc(20px * ${config.board.rows});
  height: calc(20px * ${config.board.cols});

  display: flex;
  flex-direction: column;

  overflow: hidden;

  .card-row {
    height: 20px;
  }

  dt {
    display: inline-flex;

    span {
      width: 20px;
      height: 20px;

      ${({ theme }) => theme.recycle.flexCenter};

      font-size: 20px;
    }
  }
`;

const StyledImage = styled.div<{ $puzzleImg: string }>`
  // see above <span /> size for calc
  width: calc(20px * ${config.board.rows});
  height: calc(20px * ${config.board.cols});

  background: url("${props => props.$puzzleImg || ''}");
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
`;

export default function Scorecard({
  title: exampleTitle,
  card: exampleCard,
  score: exampleScore,
  puzzleImg: examplePuzzleImg
}: ScorecardProps) {
  const [puzzleImg, setPuzzleImg] = useState(examplePuzzleImg || '');
  const [category, setCategory] = useState('');
  const [solution, setSolution] = useState('');
  const { buzzer } = useContext(PuzzleContext);

  // TODO: conditionally require props (all or none)
  const isExample = Boolean(exampleTitle && exampleCard && exampleScore && examplePuzzleImg);
  const card = isExample ? exampleCard : scorecard.card;
  const showResults = buzzer && category && solution;

  useEffect(() => {
    if (!isExample) {
      fetchPuzzleImg().then(setPuzzleImg);
    }
  }, [isExample]);

  useEffect(() => {
    if (buzzer && !isExample) {
      fetchCategoryAndSolution().then(({ category, solution }) => {
        setCategory(category);
        setSolution(solution);
      });
    }
  }, [buzzer, isExample]);

  return (
    <StyledScorecard>
      <ScorecardLabel copyable={!isExample}>
        {isExample ? exampleTitle : scorecard.title}
      </ScorecardLabel>
      <div className="scorecard-eval">
        <StyledCard>
          {
            card?.map((row, i) => {
              return (
                <div key={i} className="card-row">
                  <dd aria-label={`row ${i} intel`} />
                  <dt>
                    { row.map((tile, j) => <span key={j}>{tile}</span>) }
                  </dt>
                </div>
              );
            })
          }
        </StyledCard>
        <StyledImage $puzzleImg={puzzleImg} />
      </div>
      {
        showResults &&
          <>
            <ScorecardLabel $marginTop={true}>{config.labels.category}: {category}</ScorecardLabel>
            <ScorecardLabel>{config.labels.solution}: {solution}</ScorecardLabel>
          </>
      }
    </StyledScorecard>
  );
}
