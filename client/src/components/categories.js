import { Radio } from 'antd';
import styled from 'styled-components';
import config from '../config';

const StyledCategories = styled.div`
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

    &-disabled {
      border: 1px solid var(--disabled);
      color: var(--disabled);
    }
  }
`;

export default function Categories({ disabled, prevGuesses, setCurrentGuess }) {

  return (
    <StyledCategories>
      <Radio.Group buttonStyle="solid" onChange={(e) =>  setCurrentGuess(e.target.value)}>
        {
          config.categories.map((category, idx) => {
            return (
              <Radio.Button
                key={idx}
                value={category}
                disabled={disabled || prevGuesses.includes(category)}
              >
                {category}
              </Radio.Button>
            );
          })
        }
      </Radio.Group>
    </StyledCategories>
  );
}