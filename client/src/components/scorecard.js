import { useEffect, useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import scorecard from '../utils/scorecard';
import config from '../utils/config';

const StyledScorecard = styled.div`
  .scorecard-title {
    margin-bottom: var(--space-s);
    text-align: center;
  }

  .scorecard-eval {
    display: flex;
    justify-content: center;
  }
`;

const StyledScore = styled.dl`
  display: flex;
  flex-direction: column;
  align-items: center;

  dt {
    display: inline-flex;

    span {
      width: 24px;
      height: 24px;

      ${({ theme }) => theme.recycle.flexCenter};

      font-size: 24px;
    }
  }
`;

const StyledImage = styled.div`
  // see above <span /> size for calc (4x4)
  width: calc(24px * ${props => props.$rows || 4});
  height: calc(24px * ${props => props.$cols || 4});

  background: url("${props => props.$img || ''}");
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
`;

export default function Scorecard({ title: exampleTitle, score: exampleScore, img: exampleImg }) {
  const [img, setImg] = useState(exampleImg || '');

  // TODO: conditionally require props (all or none)
  const isExample = exampleTitle && exampleScore && exampleImg;
  const score = isExample ? exampleScore : scorecard.score;

  const getImg = async () => {
    try {
      let imgRes = await axios.get('img');
      setImg(imgRes.data);
    } catch (err) {
      console.log('getImg() Error!', err.message);
    }
  };

  useEffect(() => {
    if (!isExample) {
      getImg();
    }
  }, [isExample]);

  return (
    <StyledScorecard>
      <h5 className="scorecard-title">{isExample ? exampleTitle : scorecard.title}</h5>
      <div className="scorecard-eval">
        <StyledScore>
          {
            score.map((row, i) => {
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
        </StyledScore>
        <StyledImage $img={img} $rows={config.board.rows} $cols={config.board.cols} />
      </div>
    </StyledScorecard>
  );
}