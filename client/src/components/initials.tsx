import { Button, Input, Typography } from 'antd';
import styled from 'styled-components';
import { useState } from 'react';

import Modal from './modal';

import config from '../utils/config';
import { generateDeviceId } from '../utils/deviceId';
import scorecard, { MAX_SCORE } from '../utils/scorecard';
import { submitScore } from '../utils/leaderboard';

import type { SubmitScoreSuccess } from '../lib/types';

const USER_INITIALS_KEY = 'imagine-user-initials';

interface InitialsPrompt {
  score: number;
  onClose: () => void; 
  onSkip: () => void;
  onSuccess: (result: SubmitScoreSuccess) => void;
}

const StyledInitials = styled.div`
  ${({ theme }) => theme.recycle.flexColumnCenter};
  gap: var(--space-m);

  font-size: 12px;

  .text-block {
    margin-bottom: var(--space-s);
    text-align: center;
  }

  .input-wrapper {
    ${({ theme }) => theme.recycle.flexColumnCenter};
    gap: var(--space-xs);
  }

  .skip-button {
    margin-top: var(--space-s);

    &.ant-btn-text {
      color: var(--disabled);
      text-decoration: underline;

      &:hover {
        color: white;
      }
    }
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
  &:hover {
    background-color: black;
    border-color: dodgerblue;
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
  score,
  onClose,
  onSkip,
  onSuccess
}: InitialsPrompt) {
  const [errorMessage, setErrorMessage] = useState('');
  const [initials, setInitials] = useState(getSavedInitials());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isValid = isValidInitials(initials);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase();
    // limit to 4 characters
    if (value.length <= 4) {
      setInitials(value);
      setErrorMessage('');
    }
  };

  const handleSubmit = async () => {
    if (!isValid || isSubmitting) { return; }

    setIsSubmitting(true);
    setErrorMessage('');

    const deviceId = generateDeviceId();
    const result = await submitScore(initials.toUpperCase(), scorecard.logs, deviceId);

    setIsSubmitting(false);

    if (result.success) {
      saveInitials(initials);
      onSuccess(result);
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
    if (e.key === 'Enter' && isValid && !isSubmitting) {
      handleSubmit();
    }
  };

  return (
    <Modal header={config.labels.submitYourScore} handleClose={onClose}>
      <StyledInitials>
        <Typography.Title className="text-block" level={3}>
          {`\u{1F0CF} ${score}/${MAX_SCORE}`}
        </Typography.Title>

        <div className="input-wrapper">
          <StyledInput
            autoFocus
            disabled={isSubmitting}
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
            <Typography.Text className="text-block" type="danger">{errorMessage}</Typography.Text>
        }

        <Button
          type="primary"
          disabled={!isValid || isSubmitting}
          loading={isSubmitting}
          onClick={handleSubmit}
        >
          {config.labels.submitScore}
        </Button>

        <Button
          type="text"
          className="skip-button"
          disabled={isSubmitting}
          onClick={onSkip}
        >
          {config.labels.skip}
        </Button>
      </StyledInitials>
    </Modal>
  );
}
