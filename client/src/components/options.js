// import { useContext } from 'react';
import { Radio } from 'antd';
import styled from 'styled-components';
import config from '../utils/config';

// import { PuzzleContext } from '../App';

const StyledOptions = styled.div`
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
    border-radius: var(--space-s);
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
      border: 1px solid dodgerblue;
      color: dodgerblue;
    }
    &.ant-radio-button-wrapper-disabled {
      border: 1px solid var(--disabled);
      color: var(--disabled);
    }
  }
`;

export default function Options({
  options,
  prevGuesses,
  handleGuessChange,
  disabled
}) {
  // const { correctCategory } = useContext(PuzzleContext);

  return (
    <StyledOptions>
      <Radio.Group
        className={'' /* correctCategory ? 'plus-group' : '' */}
        onChange={(e) => handleGuessChange(e.target.value)}
      >
        {
          options.map((option, idx) => {
            return (
              <Radio.Button
                key={idx}
                value={option}
                disabled={disabled || prevGuesses.includes(option)}
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