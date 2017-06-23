export const loadView = (url, resolve) => {
  const xhr = new XMLHttpRequest();
  xhr.open("GET", url, true);
  xhr.onreadystatechange = function() {
    if (this.readyState !== 4 || this.status !== 200) {
      return;
    }
    resolve(this.responseText);
  };
  xhr.send();
};
