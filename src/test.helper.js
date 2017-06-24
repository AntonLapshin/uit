global.Element =
  global.Element ||
  function(name, children) {
    this["data-block-name"] = name;
    return {
      querySelector: () => {
        return children;
      },
      getAttribute: name => {
        return this[name];
      },
      findAncestor: () => {
        return null;
      },
      addAttribute: (name, value) => {
        this[name] = value;
      },
      style: {
        display: ""
      },
      classList: {
        add: className => {
          this[className] = true;
        }
      }
    };
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
