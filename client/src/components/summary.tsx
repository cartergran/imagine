import { Divider } from 'antd';
import styled from 'styled-components';
import { useCallback, useEffect, useState } from 'react';

import Initials from './initials';
import Leaderboard from './leaderboard';
import Scorecard from './scorecard';
import Share from './share';

const SUBMITTED_LAST_KEY = 'imagine-submitted-last';

const StyledSummary = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-s);

  .ant-divider {
    border-color: var(--divider-light);
    margin: var(--space-xs) 0;
  }
`;

type SummaryPhase = 'initials' | 'leaderboard';

function getTodayDateKey(): string {
  return new Date().toLocaleDateString('en-CA');
}

function hasSubmittedToday(): boolean {
  try {
    const submittedLastDate = localStorage.getItem(SUBMITTED_LAST_KEY);
    return submittedLastDate === getTodayDateKey();
  } catch {
    return false;
  }
}

function markSubmittedLast(): void {
  try {
    localStorage.setItem(SUBMITTED_LAST_KEY, getTodayDateKey());
  } catch {
    // ignore localStorage errors
  }
}

export default function Summary() {
  const [phase, setPhase] = useState<SummaryPhase>('initials');

  // check if already submitted on mount
  useEffect(() => {
    if (hasSubmittedToday()) {
      setPhase('leaderboard');
    }
  }, []);

  const handleInitialsSkip = useCallback(() => {
    setPhase('leaderboard');
  }, []);

  const handleInitialsSuccess = useCallback(() => {
    markSubmittedLast();
    setPhase('leaderboard');
  }, []);

  const phaseContent: Record<SummaryPhase, React.ReactNode> = {
    initials: (
      <Initials
        onSkip={handleInitialsSkip}
        onSuccess={handleInitialsSuccess}
      />
    ),
    leaderboard: (
      <>
        <Leaderboard />
        <Divider />
        <Share />
      </>
    )
  };

  return (
    <StyledSummary>
      <Scorecard />

      <Divider />

      {phaseContent[phase]}
    </StyledSummary>
  );
}
