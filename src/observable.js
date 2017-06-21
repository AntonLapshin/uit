/**
 * Typical implementation of the Observable variables
 */

const _subs = [];
const _uid = 0;

const on = (uid, handler) => {
  let hs = _subs[uid];
  if (!hs) {
    hs = [];
    _subs[uid] = hs;
  }
  hs.push(handler);
};

const off = (uid, handler) => {
  const hs = _subs[uid];
  if (!hs) {
    return;
  }

  const i = hs.indexOf(handler);
  hs.splice(i, 1);
};

const fire = (uid, data, oldData) => {
  const hs = _subs[uid];
  if (!hs) {
    return;
  }

  hs.forEach(h => {
    h(data, oldData);
  });
};

export const Observable = data => {
  const _data = data;
  const uid = _uid++;

  const Observable = data => {
    if (data === undefined) {
      return _data;
    }

    const oldData = _data;
    _data = data;
    fire(uid, data, oldData);
  };

  Observable.on = h => {
    on(uid, h);
  };
  Observable.off = h => {
    off(uid, h);
  };

  return Observable;
};
