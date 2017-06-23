export const loadScript = (url, resolve) => {
  const script = document.createElement("script");
  script.type = "text/javascript";

  if (script.readyState) {
    // IE
    script.onreadystatechange = function() {
      if (script.readyState == "loaded" || script.readyState == "complete") {
        script.onreadystatechange = null;
        resolve();
      }
    };
  } else {
    // Others
    script.onload = function() {
      resolve(script);
    };
  }

  script.src = url;
  document.getElementsByTagName("head")[0].appendChild(script);
};
