import { ReactNode } from 'react';
import styled from 'styled-components';

import Toolbar from './toolbar';

interface LayoutProps {
  children: ReactNode;
}

const StyledLayout = styled.div`
  width: 100%;
  min-height: 100dvh;
  margin: 0 auto;

  display: flex;
  flex-direction: column;
`;

export default function Layout({ children }: LayoutProps) {
  return (
    <StyledLayout>
      <main>
        { children }
      </main>
      <Toolbar />
    </StyledLayout>
  );
}
