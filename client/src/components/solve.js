import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { duration } from "../config";

const StyledSolve = styled.div`
  ${({ theme }) => theme.recycle.flexCenter};

  margin: 24px 0;

  #solve {
    ${({ theme }) => theme.recycle.flexCenter};
    flex-direction: column;
    gap: 8px;

    #input-guess {
      height: 24px;
      width: 144px;

      padding: 0 4px;
      text-align: center;

      &:focus { outline: 0; }
    }

    #submit-guess {
      height: 32px;
      width: 72px;

      &:active { background-color: grey; }
    }

    > * {
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

export default function Solve({ active, onSubmit }) {
  const inputRef = useRef(null);
  const [guess, setGuess] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: if (checkCorrect(guess)) else
    onSubmit((prevState) => { return { clickable: true, guesses: --prevState.guesses }});
    setGuess("");
  };

  useEffect(() => {
    active && setTimeout(() => inputRef.current.focus(), duration / 2);
  }, [active])

  return (
    <StyledSolve>
      <div id="solve" className={active ? "active" : "inactive"}>
        <input
          ref={inputRef}
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