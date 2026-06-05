import { definePage } from '../definePage';

import icon from './assets/icon.png';
import { RoomHits } from './RoomHits';

export const towerPage = definePage({
  id: "tower",
  path: "/tower",
  title: "Tower",
  icon,
  children: <RoomHits />,
});
