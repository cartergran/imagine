import styled from 'styled-components';

import { X as CloseIcon } from 'lucide-react';

const StyledModal = styled.dialog`
  width: 100%;
  height: 100%;

  ${({ theme }) => theme.recycle.flexCenter};

  position: fixed;
  top: 0;
  left: 0;

  background-color: black;
  border: none;
  padding: 0;
  z-index: ${process.env.REACT_APP_MAGIC_NUM};

  .modal {
    display: flex;
    flex-direction: column;
    gap: var(--space-l);

    position: relative;

    color: white;
    max-width: 480px;
    padding: var(--space-xl);
    text-align: center;
  }

  .modal-close {
    position: absolute;
    top: 0;
    right: 0;
  }

  .modal-header {
    h3 {
      font-size: 22px;
    }
  }
`;

export default function Modal({ header, children, handleClose }) {
  return (
    <StyledModal>
      <div className="modal">
        {
          handleClose &&
            <button className="modal-close" onClick={handleClose}>
              <CloseIcon size={32} />
            </button>
        }
        <div className="modal-header">
          <h3>{header}</h3>
        </div>
        <div className="modal-content">
          { children }
        </div>
      </div>
    </StyledModal>
  );
}