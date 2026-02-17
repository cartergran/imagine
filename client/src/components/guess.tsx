import { Input } from 'antd';
import styled from 'styled-components';

const StyledGuess = styled(Input)`
  width: 244px;

  background-color: black;
  border: 1px solid white;
  border-radius: 8px;
  color: white;
  font-size: 11px;
  margin-bottom: var(--space-m);
  padding: var(--space-s);

  &::placeholder {
    color: var(--disabled);
  }

  &:focus,
  &:focus-within,
  &:hover {
    background-color: black;
    border-color: dodgerblue;
    box-shadow: none;
    color: white;
  }

  &[disabled] {
    border-color: var(--disabled);
    color: var(--disabled);
  }
`;

const defaultPlaceholder = 'Your guess...';

interface GuessProps {
  disabled: boolean;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPressEnter: () => Promise<void>;
}

export default function Guess({ disabled, placeholder, value, onChange, onPressEnter }: GuessProps) {
  return (
    <StyledGuess
      autoFocus
      disabled={disabled}
      id="guess-input"
      placeholder={placeholder || defaultPlaceholder}
      maxLength={32}
      value={value}
      onChange={onChange}
      onPressEnter={onPressEnter}
    />
  );
}
