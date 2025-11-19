import { Radio } from 'antd';
import styled from 'styled-components';

import config from '../utils/config';

const StyledOptions = styled.div`
  margin-bottom: var(--space-m);

  .ant-radio-group {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: auto auto;
    gap: var(--space-s);

    // + formation
    &.plus-group {
      :nth-child(odd) {
        grid-column: 2;
      }
      :nth-child(4n-2) {
        grid-column: 1;
      }
      :n-child(4n) {
        grid-column: 2;
      }
    }
  }

  .ant-radio-button-wrapper {
    width: 116px;

    ${({ theme }) => theme.recycle.flexCenter};

    background-color: black;
    border: 1px solid white;
    border-radius: 8px;
    color: white;
    font-size: 11px;
    padding-inline: 0;
    transition:
      border ${config.duration}ms,
      color ${config.duration}ms;

    &::before {
      content: none; // pseudo-element not rendered
    }

    // increase specificity to override antd
    &.ant-radio-button-wrapper-checked {
      border-color: dodgerblue;
      color: dodgerblue;
    }
    &.ant-radio-button-wrapper-disabled {
      border-color: var(--disabled);
      color: var(--disabled);
    }
  }
`;

export default function Options({
  guesses,
  options,
  value,
  onChange,
  disabled
}) {
  return (
    <StyledOptions>
      <Radio.Group
        value={value}
        onChange={onChange}
      >
        {
          options.map((option, idx) => {
            return (
              <Radio.Button
                key={idx}
                value={option}
                disabled={disabled || guesses.includes(option)}
              >
                {option}
              </Radio.Button>
            );
          })
        }
      </Radio.Group>
    </StyledOptions>
  );
}