import { Button, Empty, List, Skeleton, Typography } from 'antd';
import { CrownFilled, ReloadOutlined, UserOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { useCallback, useEffect, useState } from 'react';

import config from '../utils/config';
import { fetchLeaderboard } from '../utils/leaderboard';
import { getSavedInitials } from './initials';
import { MAX_SCORE } from '../utils/scorecard';

import type { LeaderboardEntry, LeaderboardResponse } from '../lib/types';

interface LeaderboardProps {
  highlightRank?: number;
}

const StyledLeaderboard = styled.div`
  .ant-list-item {
    padding: var(--space-s) var(--space-m);
    border-block-end: 1px solid var(--divider-light);

    &.highlighted {
      background-color: var(--highlight-light);
      border-radius: 4px;
    }
  }

  .ant-list-empty-text {
    color: var(--disabled);
  }

  .ant-empty-description {
    color: var(--disabled);
  }

  .entries {
    width: 100%;
    max-height: 300px;

    overflow: auto;

    .entry {
      width: 100%;

      ${({ theme }) => theme.recycle.flexCenter};
      gap: var(--space-s);

      &-rank {
        min-width: 32px;
      }

      &-initials {
        flex: 1;
        font-weight: 600;
        letter-spacing: 2px;
      }

      &-score {
        font-family: monospace;
      }
    }
  }

  .results {
    ${({ theme }) => theme.recycle.flexColumnCenter};
    gap: var(--space-s);
  }

  .highlight-icon {
    margin-left: var(--space-xs);

    &.crown {
      color: gold;
    }

    &.user {
      color: dodgerblue;
    }
  }
`;

export default function Leaderboard({ highlightRank }: LeaderboardProps) {
  const [data, setData] = useState<LeaderboardResponse | null>(null);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const savedInitials = getSavedInitials();

  const loadLeaderboard = useCallback(async () => {
    setHasError(false);
    setIsLoading(true);

    const response = await fetchLeaderboard();

    if (response.error) {
      setHasError(true);
    } else {
      setData(response);
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadLeaderboard();
  }, [loadLeaderboard]);

  const handleRefresh = () => {
    loadLeaderboard();
  };

  const isHighlighted = (entry: LeaderboardEntry): boolean => {
    // TODO:
    // highlight by rank if provided (from recent submission)
    // if (highlightRank && entry.rank === highlightRank) {
    //   return true;
    // }
    // highlight by matching initials from localStorage
    if (savedInitials && entry.initials === savedInitials.toUpperCase()) {
      return true;
    }
    return false;
  };

  const renderEntry = (entry: LeaderboardEntry) => {
    const highlighted = isHighlighted(entry);
    const isFirstPlace = entry.rank === 1;

    const renderIcon = () => {
      if (isFirstPlace) {
        return <CrownFilled className="highlight-icon crown" />;
      }
      if (highlighted) {
        return <UserOutlined className="highlight-icon user" />;
      }
      return null;
    };

    return (
      <List.Item className={highlighted ? 'highlighted' : ''}>
        <div className="entry">
          <Typography.Text type="secondary" className="entry-rank">
            #{entry.rank}
          </Typography.Text>
          <Typography.Text className="entry-initials">
            {entry.initials}
          </Typography.Text>
          <Typography.Text className="entry-score">
            {entry.score}/{MAX_SCORE}
          </Typography.Text>
          {renderIcon()}
        </div>
      </List.Item>
    );
  };

  // loading state
  if (isLoading) {
    return (
      <StyledLeaderboard>
        <div className="results">
          <Typography.Title level={5}>{config.labels.leaderboardTitle}</Typography.Title>
          <Skeleton active paragraph={{ rows: 5 }} />
        </div>
      </StyledLeaderboard>
    );
  }

  // error state
  if (hasError) {
    return (
      <StyledLeaderboard>
        <div className="results">
          <Typography.Title level={5}>{config.labels.leaderboardTitle}</Typography.Title>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <Typography.Text type="secondary">
                {config.labels.leaderboardError}
              </Typography.Text>
            }
          >
            <Button type="primary" icon={<ReloadOutlined />} onClick={handleRefresh}>
              {config.labels.leaderboardRetry}
            </Button>
          </Empty>
        </div>
      </StyledLeaderboard>
    );
  }

  // empty state
  if (!data || data.entries.length === 0) {
    return (
      <StyledLeaderboard>
        <div className="results">
          <Typography.Title level={5}>{config.labels.leaderboardTitle}</Typography.Title>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <Typography.Text type="secondary">
                {config.labels.leaderboardEmpty}
              </Typography.Text>
            }
          />
        </div>
      </StyledLeaderboard>
    );
  }

  // success state with data
  return (
    <StyledLeaderboard>
      <div className="results">
        <Typography.Title level={5}>{config.labels.leaderboardTitle}</Typography.Title>
        <Typography.Text type="secondary">
          {config.title} #{data.puzzleNum} • {data.totalPlayers} {config.labels.leaderboardPlayers}
        </Typography.Text>

        <List
          className="entries"
          dataSource={data.entries}
          renderItem={renderEntry}
        />

        <Button
          type="text"
          icon={<ReloadOutlined />}
          size="small"
          onClick={handleRefresh}
        >
          {config.labels.leaderboardRefresh}
        </Button>
      </div>
    </StyledLeaderboard>
  );
}
