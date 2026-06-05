import { Workshop } from '@components/Book/Workshop';
import { definePage } from '../definePage';

import background from './assets/background.png';
import icon from './assets/icon.png';

export const gatheringPage = definePage({
  id: "gathering",
  path: "/gathering",
  title: "Gathering",
  icon,
  background,
  transparentBackground: true,
  children: <Workshop name="Gathering" professionType="gathering" />,
});
