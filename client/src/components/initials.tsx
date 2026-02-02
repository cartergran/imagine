import { Button, Input, Typography } from 'antd';
import styled from 'styled-components';
import { useState } from 'react';

import config from '../utils/config';
import { generateDeviceId } from '../utils/deviceId';
import { isBlockedInitials } from '../utils/blocklist';
import scorecard from '../utils/scorecard';
import { submitScore } from '../utils/leaderboard';

const USER_INITIALS_KEY = 'imagine-user-initials';

interface InitialsProps {
  onSkip: () => void;
  onSuccess: () => void;
}

const StyledInitials = styled.div`
  ${({ theme }) => theme.recycle.flexColumnCenter};
  gap: var(--space-m);

  .wrapper {
    ${({ theme }) => theme.recycle.flexColumnCenter};
    gap: var(--space-xs);
  }

  h5.ant-typography {
    margin: 0;
  }

  .ant-btn-text {
    text-decoration: underline;
  }
`;

const StyledInput = styled(Input)`
  width: 120px;

  background-color: black;
  border: 1px solid white;
  border-radius: 8px;
  color: white;
  font-size: 18px;
  letter-spacing: var(--space-xs);
  padding: var(--space-s);
  text-align: center;
  text-transform: uppercase;

  &::placeholder {
    color: var(--disabled);
    letter-spacing: normal;
  }

  &:focus,
  &:focus-within,
  &:hover {
    background-color: black;
    border-color: dodgerblue;
    box-shadow: none;
    color: white;
  }
`;

// regex for valid initials: 2-4 alphanumeric characters
const INITIALS_PATTERN = /^[A-Za-z0-9]{2,4}$/;

function isValidInitials(initials: string): boolean {
  return INITIALS_PATTERN.test(initials);
}

function getSavedInitials(): string {
  try {
    return localStorage.getItem(USER_INITIALS_KEY) || '';
  } catch {
    return '';
  }
}

function saveInitials(initials: string): void {
  try {
    localStorage.setItem(USER_INITIALS_KEY, initials.toUpperCase());
  } catch {
    // ignore localStorage errors
  }
}

export default function Initials({
  onSkip,
  onSuccess
}: InitialsProps) {
  const [errorMessage, setErrorMessage] = useState('');
  const [initials, setInitials] = useState(getSavedInitials());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isValid = isValidInitials(initials);
  const isBlocked = isBlockedInitials(initials);
  const canSubmit = isValid && !isBlocked;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase();
    // limit to 4 characters
    if (value.length <= 4) {
      setInitials(value);
      // show immediate feedback if initials are blocked
      if (isBlockedInitials(value)) {
        setErrorMessage(config.labels.errorInvalidInitials);
      } else {
        setErrorMessage('');
      }
    }
  };

  const handleSubmit = async () => {
    if (!canSubmit || isSubmitting) { return; }

    setIsSubmitting(true);
    setErrorMessage('');

    const deviceId = generateDeviceId();
    const result = await submitScore(initials.toUpperCase(), scorecard.logs, deviceId);

    setIsSubmitting(false);

    if (result.success) {
      saveInitials(initials);
      onSuccess();
    } else {
      // map error codes to user-friendly messages
      switch (result.error) {
        case 'ALREADY_SUBMITTED':
          setErrorMessage(config.labels.errorAlreadySubmitted);
          break;
        case 'INVALID_INITIALS':
          setErrorMessage(config.labels.errorInvalidInitials);
          break;
        case 'RATE_LIMITED':
          setErrorMessage(config.labels.errorRateLimited);
          break;
        default:
          setErrorMessage(result.message || config.labels.errorSubmitFailed);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && canSubmit && !isSubmitting) {
      handleSubmit();
    }
  };

  return (
    <StyledInitials>
      <Typography.Title level={5}>
        {config.labels.submitYourScore}
      </Typography.Title>

      <div className="wrapper">
        <StyledInput
          autoFocus
          disabled={isSubmitting}
          id="initials-input"
          maxLength={4}
          placeholder="AAA"
          value={initials}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
        />
        <Typography.Text type="secondary">{config.labels.initialsLabel}</Typography.Text>
      </div>

      {
        errorMessage &&
          <Typography.Text type="danger">
            {errorMessage}
          </Typography.Text>
      }

      <div className="wrapper">
        <Button
          type="primary"
          disabled={!canSubmit || isSubmitting}
          loading={isSubmitting}
          onClick={handleSubmit}
        >
          {config.labels.submitScore}
        </Button>
        <Button
          type="text"
          disabled={isSubmitting}
          onClick={onSkip}
        >
          {config.labels.skip}
        </Button>
      </div>
    </StyledInitials>
  );
}
