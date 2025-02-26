import styled from 'styled-components';
import { manualConfig } from '../utils/config';

import Scorecard from './scorecard';

const StyledManual = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-m);

  text-align: left;

  .manual-subheader {
    font-size: 16px;
    font-weight: 500;
  }

  .manual-details {
    ul {
      font-size: 14px;
      padding-left: var(--space-m);
    }

    li:has(ul) {
      list-style-type: none;
      margin-top: var(--space-s);
    }
  }
`;

const { description, example } = manualConfig;

export default function Manual() {
  return (
    <StyledManual>
      <h5 className="manual-subheader">{description.summary}</h5>
      <div className="manual-details">
        <ul>
          { description.details.map((detail, i) => <li key={i}>{detail}</li>) }
          <li>
            <ul>
              {
                Object.entries(description.scoring).map(([ color, spec ], i) =>
                  <li key={i}>{`${color}: ${spec}`}</li>
                )
              }
            </ul>
          </li>
        </ul>
      </div>
      <h5 className="manual-subheader">{example.subheader}</h5>
      <div className="manual-example">
        <Scorecard title={example.overview} score={example.score} img={example.img} />
      </div>
    </StyledManual>
  );
}