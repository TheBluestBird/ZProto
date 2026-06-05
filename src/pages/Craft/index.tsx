import { Workshop } from '@components/Book/Workshop';
import { definePage } from '../definePage';

import icon from './assets/icon.png';

export const craftPage = definePage({
  id: "craft",
  path: "/craft",
  title: "Craft",
  icon,
  children: <Workshop name="Craft" professionType="craft" />,
});
