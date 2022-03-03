import { getRooms, Room } from '../apis/RoomApi';
import { postUserRoomConfig } from '../apis/UserRoomConfigApi';
import { Div } from '../components/Div';
import { onClick, setStyle } from '../utils/DomUtils';
import { setURL } from '../utils/HistoryUtils';

export const RoomList = () => {
  const el = Div();
  let rooms: Room[] = [];

  async function init() {
    rooms = await getRooms();

    for (const room of rooms) {
      const roomEl = Div();

      setStyle(roomEl, {
        display: "flex",
        padding: "20px",
        borderBottom: "1px solid black"
      });

      onClick(roomEl, async () => {
        await postUserRoomConfig({
          ...room.userRoomConfig,
          room: room._id,
          unreadCount: 0
        })
        setURL(`/rooms/${room._id}`)
      })

      const roomNameEl = Div();
      roomNameEl.innerText = room.name;
      roomNameEl.classList.add("hover:text-primary");

      roomEl.append(roomNameEl)

      if (room.userRoomConfig?.unreadCount > 0) {
        const unreadCountEl = Div();
        setStyle(unreadCountEl, {
          marginLeft: "8px",
          backgroundColor: "red",
          borderRadius: "999px",
          paddingLeft: "8px",
          paddingRight: "8px",
          color: "white"
        });
        unreadCountEl.innerText = String(room.userRoomConfig.unreadCount);
        roomEl.append(unreadCountEl)
      }

      el.append(roomEl);
    }
  }

  init();

  return el;
};
