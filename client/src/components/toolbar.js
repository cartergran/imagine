import { useContext, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { ChartNoAxesColumn as SummaryIcon } from 'lucide-react';
import config from '../utils/config';

import { PuzzleContext } from '../App';
import Modal from './modal';
import Summary from './summary';

const StyledToolbar = styled.footer`
  width: 100%;
  max-width: 480px;

  display: flex;
  justify-content: flex-end;
  align-items: center;

  align-self: center;

  // position: fixed;
  // bottom: 0;

  color: white;
  padding: var(--space-m);
`;

const iconSize = 32;

export default function Toolbar() {
  const [displaySummary, setDisplaySummary] = useState(false);
  const [modalProps, setModalProps] = useState({ header: '', handleClose() {} });

  const { buzzer, correctSolution } = useContext(PuzzleContext);
  const summary = useMemo(() => ({
    toggle: buzzer,
    header: correctSolution ? config.msgs.correct : config.msgs.incorrect
  }), [buzzer, correctSolution]);

  // [summary] updates once @ end --> buzzer = true, correctSolution = true || false
  useEffect(() => {
    if (summary.toggle) {
      setModalProps({
        header: summary.header,
        handleClose: () => setDisplaySummary(false)
      });
      setDisplaySummary(true);
    }
  }, [summary]);

  const handleSummaryClick = () => {
    setModalProps({
      header: summary.header,
      handleClose: () => setDisplaySummary(false)
    });
    setDisplaySummary(true);
  };

  return (
    <>
      <StyledToolbar>
        <button onClick={handleSummaryClick} disabled={!summary.toggle}>
          <SummaryIcon size={iconSize} />
        </button>
      </StyledToolbar>
      {
        (displaySummary) && 
          <Modal header={modalProps.header} handleClose={modalProps.handleClose}>
            <Summary />
          </Modal>
      }
    </>
  );
}