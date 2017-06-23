import { loadImage } from "./loaders/image";
import { loadStyle } from "./loaders/style";
import { loadScript } from "./loaders/script";
import { loadView } from "./loaders/view";

const TIMEOUT = 3000;
const LOADERS = [
  {
    type: "image",
    load: loadImage,
    ext: /\b(png|jpg|gif)\b/
  },
  {
    type: "style",
    load: loadStyle,
    ext: /\b(css)\b/
  },
  {
    type: "script",
    load: loadScript,
    ext: /\b(js)\b/
  },
  {
    view: "view",
    load: loadView,
    ext: /\b(html)\b/
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
  return new Promise(resolve => {
    if (!loader) {
      throw `Loader for <${ext}> files has not been implemented`;
    }
    if (!loader.cache) {
      loader.cache = {};
    }
    loader.load(url, res => {
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
