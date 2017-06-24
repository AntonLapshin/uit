export const loadScript = (url, resolve) => {
  const script = document.createElement("script");
  script.type = "text/javascript";

  script.onload = function() {
    resolve(script);
  };

  script.src = url;
  document.getElementsByTagName("head")[0].appendChild(script);
};
