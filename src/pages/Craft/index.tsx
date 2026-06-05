import { Workshop } from '@components/Book/Workshop';
import { definePage } from '../definePage';

import background from './assets/background.png';
import icon from './assets/icon.png';

export const craftPage = definePage({
  id: "craft",
  path: "/craft",
  title: "Craft",
  icon,
  background,
  transparentBackground: true,
  children: <Workshop name="Craft" professionType="craft" />,
});
