// The 'theme' object is your Tailwind theme config

import { Font } from '@react-pdf/renderer';
import { createTw } from 'react-pdf-tailwind';

export const tw = createTw({
  theme: {
    fontFamily: {
      sans: ['Merriweather'],
	  body: ['RobotoCondensed'],
    },
    extend: {
      colors: {
        custom: '#bada55',
      },
    },
  },
});

Font.register({
  family: 'Merriweather',
  fonts: [
    { src: '/fonts/Merriweather-Regular.ttf' }, // font-style: normal, font-weight: normal
    { src: '/fonts/Merriweather-Bold.ttf', fontWeight: 700 },
    { src: '/fonts/Merriweather-Black.ttf', fontWeight: 900 },
    { src: '/fonts/Merriweather-Light.ttf', fontWeight: 300 },
  ],
});

Font.register({
  family: 'RobotoCondensed',
  fonts: [
    { src: '/fonts/RobotoCondensed-Thin.ttf', fontWeight: 100 },
    { src: '/fonts/RobotoCondensed-ExtraLight.ttf', fontWeight: 200 },
    { src: '/fonts/RobotoCondensed-Light.ttf', fontWeight: 300 },
    { src: '/fonts/RobotoCondensed-Regular.ttf' }, // font-style: normal, font-weight: normal
    { src: '/fonts/RobotoCondensed-Medium.ttf', fontWeight: 500 },
    { src: '/fonts/RobotoCondensed-SemiBold.ttf', fontWeight: 600 },
    { src: '/fonts/RobotoCondensed-Bold.ttf', fontWeight: 700 },
    { src: '/fonts/RobotoCondensed-ExtraBold.ttf', fontWeight: 800 },
    { src: '/fonts/RobotoCondensed-Black.ttf', fontWeight: 900 },
  ],
});
