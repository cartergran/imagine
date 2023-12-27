import { useState } from "react";
import styled from "styled-components";

const StyledScore = styled.div`
  ${({ theme }) => theme.recycle.flexCenter};
`;

export default function Score({ numGuesses }) {
  return (
    <StyledScore></StyledScore>
  )
}