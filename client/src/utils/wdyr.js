import React from 'react';

if (process.env.REACT_APP_NODE_ENV === 'dev') {
  const whyDidYouRender = require('@welldone-software/why-did-you-render');
  whyDidYouRender(React, {
    trackAllPureComponents: true,
    logOnDifferentValues: true
  });
}