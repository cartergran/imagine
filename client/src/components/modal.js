import styled from "styled-components";
import { title, day, msgs } from "../config";

const StyledModal = styled.dialog`
  width: 100%;
  height: 100%;

  ${({ theme }) => theme.recycle.flexCenter};

  position: fixed;
  top: 0;
  left: 0;

  background: black;
  border: none;
  padding: 0;
  z-index: ${process.env.REACT_APP_MAGIC_NUM};

  #modal {
    color: white;
    max-width: 480px;
    padding: 16px;
    text-align: center;

    #content {
      width: 320px;

      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .stats {
      &-title {
        font-size: 20px;
      }
    }
  }
`;

export default function Modal({ success }) {
  return (
    <StyledModal>
      <div id="modal">
        <div id="close"></div>
        <div id="content">
          <h2>{ success ? msgs.success : msgs.failure }</h2>
          <div id="stats">
            <div id="stats-title">{`${title} #${day}`}</div>
          </div>
        </div>
      </div>
    </StyledModal>
  );
}