export const loadScript = (url, resolve) => {
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
      resolve(script);
    };
  }

  script.src = url;
  document.getElementsByTagName("head")[0].appendChild(script);
};
