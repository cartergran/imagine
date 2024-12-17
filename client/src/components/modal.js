import styled from 'styled-components';

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

  #modal {
    color: white;
    max-width: 480px;
    padding: var(--space-l);
    text-align: center;

    #content {
      width: 320px;
    }
  }
`;

export default function Modal({ children }) {
  return (
    <StyledModal>
      <div id="modal">
        <div id="close">
          { /* TODO */ }
        </div>
        <div id="content">
          { children }
        </div>
      </div>
    </StyledModal>
  );
}