import React from 'react';

if (import.meta.env.VITE_NODE_ENV === 'dev' && import.meta.env.VITE_WHY_DID_YOU_RENDER === true) {
  const { default: wdyr } = await import('@welldone-software/why-did-you-render');

  wdyr(React, {
    include: [/.*/],
    trackAllPureComponents: true,
    trackHooks: true,
  });
}
