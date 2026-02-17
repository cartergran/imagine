import { Button } from 'antd';
import {
  ChartNoAxesColumn as SummaryIcon,
  CircleHelp as ManualIcon,
  Trophy as LeaderboardIcon
} from 'lucide-react';
import { ReactElement, useCallback, useContext, useEffect, useState } from 'react';
import styled from 'styled-components';

import Leaderboard from './leaderboard';
import Manual from './manual';
import Modal, { ModalProps } from './modal';
import Summary from './summary';

import config, { manualConfig } from '../utils/config';
import { PuzzleContext } from '../lib/contexts';

type ModalState = Pick<ModalProps, 'header' | 'handleClose'>;

const StyledToolbar = styled.footer`
  width: 100%;
  max-width: 480px;

  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: var(--space-s);

  position: absolute;
  bottom: 0;
  @media (width > 1024px) { position: static; }

  align-self: center;

  padding: var(--space-m);
`;

const iconSize = 32;
const { tools } = config;

const renderTools: Record<string, ReactElement> = {
  [tools.closed]: <></>,
  [tools.leaderboard]: <Leaderboard />,
  [tools.manual]: <Manual />,
  [tools.summary]: <Summary />
};

export default function Toolbar() {
  const [activeTool, setActiveTool] = useState<string>(tools.closed);
  const [modalProps, setModalProps] = useState<ModalState>({
    header: '',
    handleClose: () => { /* no-op */ }
  });

  const { correctSolution, buzzer } = useContext(PuzzleContext);

  // summary updates once @ end --> buzzer = true, correctSolution = true || false
  const summary = {
    toggle: buzzer,
    header: correctSolution ? config.labels.correct : config.labels.incorrect
  };

  // useCallback for useEffect dep
  const handleSummaryClick = useCallback(() => {
    setModalProps({
      header: summary.header,
      handleClose: () => setActiveTool(tools.closed)
    });
    setActiveTool(tools.summary);
  }, [summary.header]);

  const handleManualClick = () => {
    setModalProps({
      header: manualConfig.header,
      handleClose: () => setActiveTool(tools.closed)
    });
    setActiveTool(tools.manual);
  };

  const handleLeaderboardClick = () => {
    setModalProps({
      header: config.labels.leaderboardTitle,
      handleClose: () => setActiveTool(tools.closed)
    });
    setActiveTool(tools.leaderboard);
  };

  useEffect(() => {
    if (summary.toggle) {
      const delay = config.duration * 3;
      setTimeout(handleSummaryClick, delay);
    }
  }, [summary.toggle, handleSummaryClick]);

  return (
    <>
      <StyledToolbar>
        <Button
          type="text"
          icon={<SummaryIcon color="white" size={iconSize} />}
          disabled={!summary.toggle}
          onClick={handleSummaryClick}
        />
        <Button
          type="text"
          icon={<ManualIcon color="white" size={iconSize} />}
          onClick={handleManualClick}
        />
        <Button
          type="text"
          icon={<LeaderboardIcon color="white" size={iconSize} />}
          onClick={handleLeaderboardClick}
        />
      </StyledToolbar>
      {
        activeTool && renderTools[activeTool] &&
          <Modal header={modalProps.header} handleClose={modalProps.handleClose}>
            { renderTools[activeTool] }
          </Modal>
      }
    </>
  );
}
