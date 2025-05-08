import styled from 'styled-components';
import { manualConfig } from '../utils/config';

import Scorecard from './scorecard';

const StyledManual = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-s);

  font-size: 14px;
  text-align: left;

  .manual-subheader {
    font-size: 16px;
    font-weight: 500;
  }

  .manual-details, .manual-scoring {
    ul {
      padding-left: var(--space-m);
    }
  }

  .manual-scoring {
    font-size: 12px;
  }
`;

const { description, scoring, example } = manualConfig;

export default function Manual() {
  return (
    <StyledManual>
      <h5 className="manual-subheader">{description.summary}</h5>
      <div className="manual-details">
        <ul>
          { description.details.map((detail, i) => <li key={i}>{detail}</li>) }
        </ul>
      </div>
      <h5 className="manual-subheader">{scoring.subheader}</h5>
      <div className="manual-scoring">
        <ul>
          {
            Object.entries(scoring.counts).map(([ color, spec ], i) =>
              <li key={i}>{`${color}: ${spec}`}</li>
            )
          }
        </ul>
      </div>
      <h5 className="manual-subheader">{example.subheader}</h5>
      <div className="manual-example">
        <Scorecard
          title={example.overview}
          card={example.card}
          score={example.score}
          img={example.img}
        />
      </div>
    </StyledManual>
  );
}