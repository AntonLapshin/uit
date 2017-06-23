import { loadImage } from "./loaders/image";
import { loadStyle } from "./loaders/style";
import { loadScript } from "./loaders/script";
import { loadView } from "./loaders/view";

const TIMEOUT = 3000;
const LOADERS = [
  {
    type: "image",
    load: loadImage,
    ext: /png|jpg|gif/
  },
  {
    type: "style",
    load: loadStyle,
    ext: /css/
  },
  {
    type: "script",
    load: loadScript,
    ext: /js/
  },
  {
    view: "view",
    load: loadView,
    ext: /html/
  }
];

/**
 * Loads an external resource
 * @param {string} url - URL of the the external resource
 * @returns {Promise}
 */
export const load = url => {
  const ext = url.split(".").pop();
  const loader = LOADERS.find(l => l.ext.test(ext));
  if (!loader) {
    throw `Loader for <${ext}> files has not been implemented`;
  }
  return new Promise(resolve => {
    if (!loader.cache) {
      loader.cache = {};
    }
    loader.load(res => {
      loader.cache[url] = res;
      resolve(res);
    });
    setTimeout(() => {
      if (loader.cache[url]) {
        return;
      }
      loader.cache[url] = true;
      resolve(true);
    }, TIMEOUT);
  });
};
