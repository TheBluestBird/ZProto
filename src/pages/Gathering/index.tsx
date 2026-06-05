import { Workshop } from '@components/Book/Workshop';
import { definePage } from '../definePage';

import icon from './assets/icon.png';

export const gatheringPage = definePage({
  id: "gathering",
  path: "/gathering",
  title: "Gathering",
  icon,
  children: <Workshop name="Gathering" professionType="gathering" />,
});
