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

  const initShareData = (): ShareData => {
    const title = scorecard.title;
    const text = scorecard.card.map((row) => row.join('')).join('\n');

    if (isMobile) {
      // ignores title field
      return { text: `${title}\n\n${text}` };
    }
    // shareData object structure
    return { title, text };
  };

  const shareData = initShareData();

  const handleShare = async (): Promise<void> => {
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        console.log('handleShare() error!', errorMessage);
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
