import { Input } from 'antd';
import styled from 'styled-components';

import config from '../utils/config';

const StyledGuess = styled(Input)`
  width: 244px;

  background-color: black;
  border: 1px solid white;
  border-radius: 8px;
  color: white;
  font-size: 11px;
  margin-bottom: var(--space-m);
  padding: var(--space-s);

  // transition:
  //   border-color ${config.duration}ms,
  //   color ${config.duration}ms;

  &::placeholder {
    color: var(--disabled);
  }

  &:focus,
  &:hover {
    background-color: black;
    border-color: dodgerblue;
    color: white;
  }

  &[disabled] {
    border-color: var(--disabled);
    color: var(--disabled);
  }
`;

const defaultPlaceholder = 'Your guess...';

export default function Guess({ disabled, placeholder, value, onChange, onPressEnter }) {
  return (
    <StyledGuess
      disabled={disabled}
      placeholder={placeholder || defaultPlaceholder}
      value={value}
      onChange={onChange}
      onPressEnter={onPressEnter}
    />
  );
}