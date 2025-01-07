import { Radio } from 'antd';
import styled from 'styled-components';

const StyledOptions = styled.div`
  .ant-radio-group {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--space-s);
  }

  .ant-radio-button-wrapper {
    width: 116px;

    ${({ theme }) => theme.recycle.flexCenter};

    background-color: black;
    border: 1px solid white;
    border-radius: var(--space-s);
    color: white;
    transition: border 1s, color 1s;

    &::before {
      content: none; // pseudo-element not rendered
    }

    // increase specificity to override antd
    &.ant-radio-button-wrapper-checked {
      border: 1px solid white;
    }

    // TODO: is double & not valid syntax?
    &.ant-radio-button-wrapper-disabled {
      border: 1px solid var(--disabled);
      color: var(--disabled);
    }
  }
`;

export default function Options({ options, disabled, prevGuesses, setCurrentGuess }) {

  return (
    <StyledOptions>
      <Radio.Group buttonStyle="solid" onChange={(e) =>  setCurrentGuess(e.target.value)}>
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