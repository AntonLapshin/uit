export const loadImage = (url, resolve) => {
  const img = new Image();
  img.onload = () => {
    resolve(img);
  };
  img.src = url;
};
