const convert = name => {
  return name.replace(/-/gi, "_");
};

global.Element =
  global.Element ||
  function(name, children) {
    const el = {
      data_block_name: name,
      querySelector: () => {
        return children;
      },
      getAttribute: name => {
        return el[convert(name)];
      },
      findAncestor: () => {
        return null;
      },
      setAttribute: (name, value) => {
        el[convert(name)] = value;
      },
      addAttribute: (name, value) => {
        el[convert(name)] = value;
      },
      style: {
        display: ""
      },
      classList: {
        add: className => {
          el.classList[className] = true;
        },
        toggle: (className, value) => {
          el.classList[className] = value;
        }
      },
      matches: selector => {
        return true;
      }
    };
    return el;
  };

class Image {
  constructor() {
    setTimeout(() => {
      this.onload();
    }, 1);
  }
}

class XMLHttpRequest {
  open() {}
  send() {
    this.responseText = "<div></div>";
    this.readyState = 4;
    this.status = 200;
    this.onreadystatechange();
  }
}

global.Image = global.Image || Image;
global.XMLHttpRequest = global.XMLHttpRequest || XMLHttpRequest;
global.document = global.document || {
  createElement: () => {
    const obj = {};
    setTimeout(() => {
      obj.onload();
    }, 1);
    return obj;
  },
  head: {
    appendChild: () => {}
  },
  getElementsByTagName: () => {
    return [
      {
        appendChild: () => {}
      }
    ];
  }
};
