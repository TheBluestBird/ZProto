import {
  ROOM_SPRITE_SIZE,
  TOWER_LAYOUT,
  TOWER_ROOM_KEYS,
  TOWER_ROOMS,
  TOWER_SPRITE_SIZE,
  type TowerRoomKey,
} from '@components/Scene/Tower/rooms';
import { libraryProfessions } from '@game/library/professions';
import { getProfessionId } from '@game/selectors/rooms';
import { useNavigation } from '@navigation/useNavigation';

const roomAspect = ROOM_SPRITE_SIZE.width / ROOM_SPRITE_SIZE.height;
const towerAspect = TOWER_SPRITE_SIZE.width / TOWER_SPRITE_SIZE.height;

export function RoomHits() {
  const { navigate } = useNavigation();

  function handleRoomClick(key: TowerRoomKey) {
    navigate('craft', getProfessionId(key));
  }

  return (
    <div className="pointer-events-none absolute inset-0">
      <div
        className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2"
        style={{
          left: `${TOWER_LAYOUT.anchorX * 100}%`,
          top: `${TOWER_LAYOUT.anchorY * 100}%`,
          height: `${TOWER_LAYOUT.heightFrac * 100}%`,
          aspectRatio: towerAspect,
        }}
      >
        {TOWER_ROOM_KEYS.map((key) => {
          const { x, y } = TOWER_ROOMS[key].coordinate;
          const professionId = getProfessionId(key);
          const label = libraryProfessions[professionId].workshop.title;

          return (
            <button
              key={key}
              type="button"
              aria-label={label}
              className="pointer-events-auto absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer border-0 bg-transparent p-0"
              style={{
                left: `${x}%`,
                top: `${y}%`,
                width: `${TOWER_LAYOUT.roomWidthFrac * 100}%`,
                aspectRatio: roomAspect,
              }}
              onClick={() => handleRoomClick(key)}
            />
          );
        })}
      </div>
    </div>
  );
}
