import axios from 'axios';
import { useContext, useEffect, useState } from 'react';
import styled from 'styled-components';
import Text from 'antd/es/typography/Text';

import config from '../utils/config';
import { PuzzleContext } from '../App';
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

const ScorecardText = styled(Text)`
  display: inline-flex;

  color: white;
  font-size: 12px;
  margin-bottom: var(--space-s);
  text-align: center;
  white-space: pre-line;
`;

const StyledCard = styled.dl`
  display: flex;
  flex-direction: column;
  align-items: center;

  margin-bottom: var(--space-m);

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

const StyledImage = styled.div<{ $img: string; $rows: number; $cols: number }>`
  // see above <span /> size for calc (4x4)
  width: calc(20px * ${props => props.$rows});
  height: calc(20px * ${props => props.$cols});

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
  const [solution, setSolution] = useState('');
  const { buzzer } = useContext(PuzzleContext);

  // TODO: conditionally require props (all or none)
  const isExample = Boolean(exampleTitle && exampleCard && exampleScore && exampleImg);
  const card = isExample ? exampleCard : scorecard.card;

  const getImg = async (): Promise<void> => {
    try {
      const imgRes = await axios.get<string>('/puzzle/img');
      setImg(imgRes.data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('getImg() Error!', errorMessage);
    }
  };

  const getSolution = async (): Promise<void> => {
    try {
      const solutionRes = await axios.get<string>('/puzzle/solution');
      setSolution(solutionRes.data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('getSolution() Error!', errorMessage);
    }
  };

  useEffect(() => {
    if (!isExample) {
      getImg();
    }
  }, [isExample]);

  useEffect(() => {
    if (buzzer && !isExample) {
      getSolution();
    }
  }, [buzzer, isExample]);

  return (
    <StyledScorecard>
      <ScorecardText copyable={!isExample}>
        {isExample ? exampleTitle : scorecard.title}
      </ScorecardText>
      <div className="scorecard-eval">
        <StyledCard>
          {
            card?.map((row, i) => {
              return (
                <div key={i}>
                  <dd aria-label={`row ${i} intel`} />
                  <dt>
                    { row.map((tile, j) => <span key={j}>{tile}</span>) }
                  </dt>
                </div>
              );
            })
          }
        </StyledCard>
        <StyledImage $img={img} $rows={config.board.rows} $cols={config.board.cols} />
      </div>
      {
        buzzer && solution && (
          <ScorecardText>Solution: {solution}</ScorecardText>
        )
      }
    </StyledScorecard>
  );
}
