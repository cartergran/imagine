import { Button } from 'antd';
import styled from 'styled-components';
import config from '../utils/config';
import scorecard from '../utils/scorecard';

const StyledShare = styled.div`
  ${({ theme }) => theme.recycle.flexCenter};
`;

// https://developer.mozilla.org/en-US/docs/Web/API/Navigator/share
export default function Share() {
  const isMobile = /iPhone/.test(navigator.userAgent);

  const initShareData = () => {
    let title = config.share;
    let text = scorecard.score.map((row) => row.join('')).join('\n');

    if (isMobile) {
      // ignores title field
      return { text: `${title}\n\n${text}` };
    }
    return { title, text };
  };

  const shareData = initShareData(isMobile);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('handleShare() error!', err.message);
      }
    }
  };

  return (
    <StyledShare>
      <Button type="primary" onClick={handleShare}>
        { config.actions.share }
      </Button>
    </StyledShare>
  );
}