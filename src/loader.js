import { loadImage } from "./loaders/image";
import { loadStyle } from "./loaders/style";
import { loadScript } from "./loaders/script";
import { loadView } from "./loaders/view";

const TIMEOUT = 3000;
const TYPES = {
  image: {
    loader: loadImage
  },
  style: {
    loader: loadStyle
  },
  script: {
    loader: loadScript
  },
  view: {
    loader: loadView
  }
};

export const load = (name, url) => {
  const type = TYPES[name];
  if (!type) {
    throw `Type <${name}> is not supported`;
  }
  return new Promise((resolve, reject) => {
    if (!type.container) {
      type.container = {};
    }
    type.loader(res => {
      type.container[url] = res;
      resolve(res);
    });
    setTimeout(() => {
      type.container[url] = true;
      resolve(true);
    });
  });
};
