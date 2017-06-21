const _images = [];
const _styles = [];
const _views = [];
const _scripts = [];
const _timeout = 3000;

export const loadImage = url => {
  return new Promise((resolve, reject) => {
    if (_images[url]) {
      resolve(_images[url]);
      return;
    }

    const img = new Image();
    img.onload = () => {
      _images[url] = img;
      resolve(img);
    };
    img.src = url;

    setTimeout(() => {
      _images[url] = true;
      resolve(img);
    }, _timeout);
  });
};

export const loadStyle = url => {
  return new Promise((resolve, reject) => {
    if (window.dropletProduction) {
      _styles[url] = true;
    }

    if (_styles[url]) {
      resolve(_styles[url]);
      return;
    }

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = url;
    document.head.appendChild(link);
    _styles[url] = true;
    resolve();
  });
};

export const loadJS = url => {
  return new Promise((resolve, reject) => {
    if (window.dropletProduction) {
      _scripts[url] = true;
    }

    if (_scripts[url]) {
      resolve(_scripts[url]);
      return;
    }

    const script = document.createElement("script");
    script.type = "text/javascript";

    if (script.readyState) {
      // IE
      script.onreadystatechange = function() {
        if (script.readyState == "loaded" || script.readyState == "complete") {
          script.onreadystatechange = null;
          _scripts[url] = script;
          resolve();
        }
      };
    } else {
      // Others
      script.onload = function() {
        _scripts[url] = script;
        resolve();
      };
    }

    script.src = url;
    document.getElementsByTagName("head")[0].appendChild(script);
  });
};

export const loadView = url => {
  return new Promise((resolve, reject) => {
    if (_views[url]) {
      resolve(_views[url]);
      return;
    }

    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.onreadystatechange = function() {
      if (this.readyState !== 4 || this.status !== 200) {
        return;
      }
      _views[url] = this.responseText;
      resolve(_views[url]);
    };
    xhr.send();
  });
};
