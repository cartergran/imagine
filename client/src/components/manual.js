import styled from 'styled-components';
import { manualConfig } from '../utils/config';

const StyledManual = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-m);

  text-align: left;

  .manual-summary {
    font-size: 16px;
    font-weight: 500;
  }

  .manual-details {
    font-size: 14px;
    list-style: none;
    list-style-type: disc;
    padding-left: var(--space-m);
  }
`;

export default function Manual() {
  return (
    <StyledManual>
      <h5 className="manual-summary">{manualConfig.description.summary}</h5>
      <ul className="manual-details">
        {
          manualConfig.description.details.map((detail, i) => <li key={i}>{detail}</li>)
        }
      </ul>
    </StyledManual>
  ); 
}