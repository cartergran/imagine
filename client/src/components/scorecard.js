import { useContext, useEffect, useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import scorecard from '../utils/scorecard';
import config from '../utils/config';
import Text from 'antd/es/typography/Text';
import { PuzzleContext } from '../App';

const StyledScorecard = styled.div`
  .scorecard-eval {
    display: flex;
    justify-content: center;
  }
`;

const ScorecardText = styled(Text)`
  width: 100%;

  display: inline-block;

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

const StyledImage = styled.div`
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
}) {
  const [img, setImg] = useState(exampleImg || '');
  const [solution, setSolution] = useState('');
  const { buzzer } = useContext(PuzzleContext);

  // TODO: conditionally require props (all or none)
  const isExample = exampleTitle && exampleCard && exampleScore && exampleImg;
  const card = isExample ? exampleCard : scorecard.card;

  const getImg = async () => {
    try {
      let imgRes = await axios.get('img');
      setImg(imgRes.data);
    } catch (err) {
      console.log('getImg() Error!', err.message);
    }
  };

  const getSolution = async () => {
    try {
      let solutionRes = await axios.get('solution');
      setSolution(solutionRes.data);
    } catch (err) {
      console.log('getSolution() Error!', err.message);
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
            card.map((row, i) => {
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