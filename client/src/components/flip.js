import styled from 'styled-components';
import config from '../utils/config';

const StyledFlip = styled.div`
  width: 100%;
  height: 100%;

  perspective: 1000px;
`;

const StyledFlipBase = styled.div`
  width: 100%;
  height: 100%;

  position: relative;

  transition: transform ${config.duration}ms;
  transform: ${props => props.$isFlipped ? 'rotateY(-180deg)' : 'rotateY(0deg)'};
  transform-style: preserve-3d;

  & .flip-content {
    border: 1px solid ${props => props.$borderColor || 'white'};
  }
`;

// .flip-content
const StyledFlipContent = styled.div`
  width: 100%;
  height: 100%;

  position: absolute;

  backface-visibility: hidden;
  // -webkit-backface-visibility: hidden; // safari
  transition: border ${config.duration * 3}ms;

  &.flip-content-back {
    transform: rotateY(-180deg);
  }
`;

export default function Flip({ borderColor, isFlipped, children }) {
  return (
    <StyledFlip>
      <StyledFlipBase $borderColor={borderColor} $isFlipped={isFlipped}>
        <StyledFlipContent className="flip-content" /> {/* front */}
        <StyledFlipContent className="flip-content flip-content-back"> {/* back */}
          { children }
        </StyledFlipContent>
      </StyledFlipBase>
    </StyledFlip>
  );
}