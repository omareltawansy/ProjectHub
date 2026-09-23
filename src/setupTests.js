// jest-dom adds custom matchers like toHaveTextContent.
import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

// react-router v7 expects these globals, which CRA's jsdom environment lacks.
if (!global.TextEncoder) global.TextEncoder = TextEncoder;
if (!global.TextDecoder) global.TextDecoder = TextDecoder;

// jsdom doesn't implement scrollIntoView (every real browser does).
if (!Element.prototype.scrollIntoView) Element.prototype.scrollIntoView = () => {};
