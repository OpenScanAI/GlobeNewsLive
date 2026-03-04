'use client';

/* eslint-disable @typescript-eslint/no-var-requires */
// v2 moved WidthProvider to legacy — use legacy import for v1 API compatibility
const legacy = require('react-grid-layout/legacy');
const WidthProvider = legacy.WidthProvider;
const ReactGridLayout = legacy.default || legacy;
const GridLayout = WidthProvider(ReactGridLayout);

export default GridLayout;
