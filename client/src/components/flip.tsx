import { ReactNode } from 'react';
import styled from 'styled-components';

import config from '../utils/config';

interface FlipProps {
  borderStyle: {
    color: string;
    width: string;
  };
  isFlipped: boolean | string;
  children: ReactNode;
}

const StyledFlip = styled.div`
  width: 100%;
  height: 100%;

  perspective: 1000px;
`;

const StyledFlipBase = styled.div<{ $isFlipped: boolean | string; $borderStyle: { color: string; width: string } }>`
  width: 100%;
  height: 100%;

  position: relative;

  transition: transform ${config.duration}ms;
  transform: ${props => props.$isFlipped ? 'rotateY(-180deg)' : 'rotateY(0deg)'};
  transform-style: preserve-3d;

  & .flip-content {
    border-style: solid;
    border-color: ${props => props.$borderStyle.color || 'white'};
    border-width: ${props => props.$borderStyle.width || '1'}px;
  }
`;

// .flip-content
const StyledFlipContent = styled.div`
  width: 100%;
  height: 100%;

  position: absolute;

  backface-visibility: hidden;
  // -webkit-backface-visibility: hidden; // safari
  transition: border ${config.duration}ms;

  &.flip-content-back {
    transform: rotateY(-180deg);
  }
`;

export default function Flip({ borderStyle, isFlipped, children }: FlipProps) {
  return (
    <StyledFlip>
      <StyledFlipBase $borderStyle={borderStyle} $isFlipped={isFlipped}>
        <StyledFlipContent className="flip-content" /> {/* front */}
        <StyledFlipContent className="flip-content flip-content-back"> {/* back */}
          { children }
        </StyledFlipContent>
      </StyledFlipBase>
    </StyledFlip>
  );
}
