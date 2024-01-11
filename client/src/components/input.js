import styled from "styled-components";

const StyledInput = styled.div`
  ${({ theme }) => theme.recycle.flexCenter};

  #input {
    height: 100px;

    ${({ theme }) => theme.recycle.flexCenter};
    flex-direction: column;
    gap: 8px;

    & input {
      height: 24px;
      width: 144px;

      border: 1px solid white;
      border-radius: 8px;
      background-color: black;
      color: white;
      padding: 0 4px;
      text-align: center;

      &:focus { outline: 0; }
    }

    & button { // TODO }
  }
`;

export default function Input({ disabled, onSubmit }) {

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit((prevState) => { return { guesses: --prevState.guesses, clickable: true }});
  };

  return (
    <StyledInput>
      <div id="input">
        <input type="text" maxLength={process.env.REACT_APP_MAGIC_NUM}/>
        <button disabled={disabled} onClick={handleSubmit}>Submit</button>
      </div>
    </StyledInput>
  );
}