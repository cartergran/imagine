import React from 'react';

if (process.env.REACT_APP_NODE_ENV === 'dev') {
  try {
    const whyDidYouRender = require('@welldone-software/why-did-you-render');
    whyDidYouRender(React, {
      trackAllPureComponents: true,
      logOnDifferentValues: true
    });
  } catch (err) { /* silently ignore */ }
}
