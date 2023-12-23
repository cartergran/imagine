import styled from "styled-components";

const StyledLayout = styled.div`
  width: 100%;
  min-height: 100vh;
  // TODO: investigate
  margin: 0 auto;

  display: flex;
  flex-direction: column;
`;

export default function Layout({ children }) {
  return (
    <StyledLayout>
      {/* <Title /> */}
      <main>
        { children }
      </main>
    </StyledLayout>
  )
}