import axios from 'axios';
import { useContext, useEffect, useState } from 'react';
import styled from 'styled-components';
import Text from 'antd/es/typography/Text';

import config from '../utils/config';
import { PuzzleContext } from '../lib/contexts';
import scorecard from '../utils/scorecard';

interface ScorecardProps {
  title?: string;
  card?: string[][];
  score?: number;
  img?: string;
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

const StyledImage = styled.div<{ $img: string }>`
  // see above <span /> size for calc
  width: calc(20px * ${config.board.rows});
  height: calc(20px * ${config.board.cols});

  background: url("${props => props.$img || ''}");
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
`;

export default function Scorecard({
  title: exampleTitle,
  card: exampleCard,
  score: exampleScore,
  img: exampleImg
}: ScorecardProps) {
  const [img, setImg] = useState(exampleImg || '');
  const [category, setCategory] = useState('');
  const [solution, setSolution] = useState('');
  const { buzzer } = useContext(PuzzleContext);

  // TODO: conditionally require props (all or none)
  const isExample = Boolean(exampleTitle && exampleCard && exampleScore && exampleImg);
  const card = isExample ? exampleCard : scorecard.card;
  const showResults = buzzer && category && solution;

  const getImg = async (): Promise<void> => {
    try {
      const imgRes = await axios.get<string>('/puzzle/img');
      setImg(imgRes.data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('getImg() Error!', errorMessage);
    }
  };

  const getCategoryAndSolution = async (): Promise<void> => {
    try {
      const [categoryRes, solutionRes] = await Promise.all([
        axios.get<string>('/puzzle/category'),
        axios.get<string>('/puzzle/solution')
      ]);
      setCategory(categoryRes.data);
      setSolution(solutionRes.data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('getCategoryAndSolution() Error!', errorMessage);
    }
  };

  useEffect(() => {
    if (!isExample) {
      getImg();
    }
  }, [isExample]);

  useEffect(() => {
    if (buzzer && !isExample) {
      getCategoryAndSolution();
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
        <StyledImage $img={img} />
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
