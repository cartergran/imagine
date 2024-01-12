import { useState } from "react";
import styled from "styled-components";

const StyledSolve = styled.div`
  ${({ theme }) => theme.recycle.flexCenter};

  #solve {
    height: 100px;

    ${({ theme }) => theme.recycle.flexCenter};
    flex-direction: column;
    gap: 8px;

    & #input-guess {
      height: 24px;
      width: 144px;

      padding: 0 4px;
      text-align: center;

      &:focus { outline: 0; }
    }

    & #submit-guess {
      height: 32px;
      width: 72px;

      &:active { background-color: grey; }
    }

    & > * {
      background-color: black;
      border-radius: 8px;
    }

    &.active > * {
      border: 1px solid white;
      color: white;
    }

    &.inactive > * {
      border: 1px solid grey;
      color: grey;
      pointer-events: none;
    }
  }
`;

export default function Solve({ inactive, onSubmit }) {
  const [guess, setGuess] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: checkGuess()
    onSubmit((prevState) => { return { clickable: true, guesses: --prevState.guesses }});
  };

  return (
    <StyledSolve>
      <div id="solve" className={inactive ? "inactive" : "active"}>
        <input
          id="input-guess"
          type="text"
          value={guess}
          onChange={(e) => setGuess(e.target.value)}
          maxLength={process.env.REACT_APP_MAGIC_NUM}
        />
        <button id="submit-guess" onClick={handleSubmit}>Submit</button>
      </div>
    </StyledSolve>
  );
}