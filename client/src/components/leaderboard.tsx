import { Button, Empty, List, Skeleton, Typography } from 'antd';
import { CrownFilled, ReloadOutlined, UserOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { useCallback, useEffect, useState } from 'react';

import config from '../utils/config';
import { fetchLeaderboard } from '../utils/leaderboard';
import { generateDeviceId } from '../utils/deviceId';
import { MAX_SCORE } from '../utils/scorecard';

import type { LeaderboardEntry, LeaderboardResponse } from '../lib/types';

const StyledLeaderboard = styled.div`
  .ant-list-item {
    padding: var(--space-s) var(--space-m);
    border-block-end: 1px solid var(--divider-lightest);

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

export default function Leaderboard() {
  const [data, setData] = useState<LeaderboardResponse | null>(null);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadLeaderboard = useCallback(async () => {
    setHasError(false);
    setIsLoading(true);

    // pass deviceId to server for isCurrentUser marking
    const deviceId = generateDeviceId();
    const response = await fetchLeaderboard({ deviceId });

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

  const renderEntry = (entry: LeaderboardEntry) => {
    const isFirstPlace = entry.rank === 1;

    const renderIcon = () => {
      if (isFirstPlace) {
        return <CrownFilled className="highlight-icon crown" />;
      }
      if (entry.isCurrentUser) {
        return <UserOutlined className="highlight-icon user" />;
      }
      return null;
    };

    return (
      <List.Item className={entry.isCurrentUser ? 'highlighted' : ''}>
        <div className="entry">
          <Typography.Text type="secondary" className="entry-rank">
            #{entry.rank}
          </Typography.Text>
          <Typography.Text className="entry-initials">
            {entry.initials}
          </Typography.Text>

          {renderIcon()}
          <Typography.Text className="entry-score">
            {entry.score}/{MAX_SCORE}
          </Typography.Text>
        </div>
      </List.Item>
    );
  };

  // loading state
  if (isLoading) {
    return (
      <StyledLeaderboard>
        <div className="results">
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
