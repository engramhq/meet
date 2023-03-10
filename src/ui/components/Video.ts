import { setElementStyles } from './Element';

export function Video(params?: {
  styles?: Partial<CSSStyleDeclaration>;
  muted?: boolean;
  onClick?: () => void;
}) {
  const el = document.createElement('video');

  setElementStyles(el, params?.styles);

  if (params?.muted) {
    el.muted = params.muted;
  }

  el.autoplay = true;
  el.playsInline = true;

  return el as HTMLVideoElement;
}
