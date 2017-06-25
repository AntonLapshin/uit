export const loadView = (url, resolve) => {
  const xhr = new XMLHttpRequest();
  xhr.open("GET", url, true);
  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4 && xhr.responseText.length > 0) {
      resolve(xhr.responseText);
    }
  };
  xhr.send();
};
