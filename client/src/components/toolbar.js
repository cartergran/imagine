import { useCallback, useContext, useEffect, useState } from 'react';
import styled from 'styled-components';
import { ChartNoAxesColumn as SummaryIcon, CircleHelp as ManualIcon } from 'lucide-react';
import config, { manualConfig } from '../utils/config';

import { PuzzleContext } from '../App';
import Manual from './manual';
import Modal from './modal';
import Summary from './summary';

const StyledToolbar = styled.footer`
  width: 100%;
  max-width: 480px;

  display: flex;
  justify-content: flex-end;
  align-items: center;

  position: absolute;
  bottom: 0;
  @media (width > 1024px) { position: static; }

  align-self: center;

  // position: fixed;
  // bottom: 0;

  color: white;
  padding: var(--space-m);
`;

const iconSize = 32;
const { tools } = config;
const renderTools = {
  [tools.summary]: <Summary />,
  [tools.manual]: <Manual />,
  [tools.default]: <></>
};

export default function Toolbar() {
  const [activeTool, setActiveTool] = useState();
  const [modalProps, setModalProps] = useState({
    header: manualConfig.header,
    handleClose: () => setActiveTool(tools.default)
  });

  const { correctSolution, buzzer } = useContext(PuzzleContext);

  // summary updates once @ end --> buzzer = true, correctSolution = true || false
  const summary = {
    toggle: buzzer,
    header: correctSolution ? config.msgs.correct : config.msgs.incorrect
  };

  const handleSummaryClick = useCallback(() => {
    setModalProps({
      header: summary.header,
      handleClose: () => setActiveTool(tools.default)
    });
    setActiveTool(tools.summary);
  }, [summary.header]);

  useEffect(() => {
    if (summary.toggle) {
      const delay = config.duration * 3;
      setTimeout(handleSummaryClick, delay);
    }
  }, [summary.toggle, handleSummaryClick]);

  const handleManualClick = () => {
    setModalProps({
      header: manualConfig.header,
      handleClose: () => setActiveTool(tools.default)
    })
    setActiveTool(tools.manual);
  };

  return (
    <>
      <StyledToolbar>
        <button onClick={handleSummaryClick} disabled={!summary.toggle}>
          <SummaryIcon size={iconSize} />
        </button>
        <button onClick={handleManualClick}>
          <ManualIcon size={iconSize} />
        </button>
      </StyledToolbar>
      {
        activeTool &&
          <Modal header={modalProps.header} handleClose={modalProps.handleClose}>
            { renderTools[activeTool] }
          </Modal>
      }
    </>
  );
}