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
  z-index: ${import.meta.env.VITE_MAGIC_NUM};

  .modal {
    // max width = board width
    // max width := (scoreWidth + imgWidth) + (paddingWidth * 2)
    // board width := (tileWidth * cols) + (boardGap * (cols - 1))
    max-width: 384px;

    display: flex;
    flex-direction: column;
    gap: var(--space-m);

    position: relative;

    background-color: slategray;
    border-radius: 8px;
    color: white;
    padding: var(--space-xl) var(--space-l);
  }

  .modal-close {
    position: absolute;
    top: var(--space-s);
    right: var(--space-s);
  }

  .modal-header {
    text-align: center;

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