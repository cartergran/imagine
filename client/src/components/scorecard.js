import { useEffect, useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import scorecard from '../utils/scorecard';

const StyledScorecard = styled.div`
  .eval {
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
      width: 23px;
      height: 23px;

      ${({ theme }) => theme.recycle.flexCenter};

      font-size: 23px;
    }
  }
`;

const StyledImage = styled.div`
  // see above <span /> size for calc (4x4)
  width: calc(23px * 4);
  height: calc(23px * 4);

  background: url("${props => props.$img || ''}");
  background-size: contain;
`;

export default function Scorecard() {
  const [score, setScore] = useState([]);
  const [img, setImg] = useState('');

  useEffect(() => {
    getImg();

    scorecard.init();
    setScore(scorecard.score);
  }, []);

  const getImg = async () => {
    try {
      let res = await axios.get(process.env.REACT_APP_BASE_URL + '/img');
      setImg(res.data);
    } catch (err) {
      console.log('getImg() Error!', err.message);
    }
  };

  return (
    <StyledScorecard>
      <h5>{scorecard.title}</h5>
      <div className="eval">
        <StyledScore>
          {
            score.map((row, i) => {
              return (
                <div key={i} className="share-row">
                  <dd aria-label={`row ${i} intel`} />
                  <dt>
                    { row.map((tile, j) => <span key={j} className="share-tile">{tile}</span>) }
                  </dt>
                </div>
              );
            })
          }
        </StyledScore>
        <StyledImage $img={img} />
      </div>
    </StyledScorecard>
  );
}