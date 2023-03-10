import { Div } from '../ui/components/Div';
import { Home } from './Home';
import { removeVideocallListeners } from './Videocall/MuteShortcuts';
import { Videocall } from './Videocall/Videocall';

export function Router() {
  const router = Div({
    styles: {
      height: '100vh',
      width: '100vw',
    },
  });

  function init() {
    removeVideocallListeners();
    handleRouteUpdated();
  }

  window.addEventListener('popstate', handleRouteUpdated);

  async function handleRouteUpdated() {
    router.innerHTML = '';

    const path = window.location.pathname;
    const urlPath = path.split('/');
    let roomId = '';
    if (urlPath[1]) {
      roomId = path;
    }

    switch (path) {
      case '/':
        router.append(Home());
        break;
      case roomId:
        router.append(Videocall());
        break;
      default:
        break;
    }
  }

  init();

  return router;
}
