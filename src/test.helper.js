const convert = name => {
  return name.replace(/-/gi, "_");
};

global.Element =
  global.Element ||
  function(name, children) {
    this.children = children;
    this.data_block_name = name;
    this.querySelectorAll = () => {
      if (this.innerHTML && this.innerHTML.indexOf("test") > -1) {
        return [new Element("test")];
      }
      return this.children || [];
    };
    this.getAttribute = name => {
      return this[convert(name)];
    };
    this.setAttribute = (name, value) => {
      this[convert(name)] = value;
    };
    this.style = {
      display: ""
    };
    this.classList = {
      add: className => {
        this.classList[className] = true;
      },
      toggle: (className, value) => {
        this.classList[className] = value;
      }
    };
    this.addEventListener = (event, handler) => {
      setTimeout(() => {
        handler();
      }, 0);
    };
    this.matches = () => {
      return true;
    };
    this.appendChild = item => {
      this.innerHTML = (this.innerHTML || "") + item;
    };
    const self = this;
    Object.defineProperty(this, "firstChild", {
      get: function() {
        return self.innerHTML;
      }
    });
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
  createElement: type => {
    if (type === "div") {
      return new Element("div", []);
    }
    const obj = {};
    setTimeout(() => {
      obj.onload && obj.onload();
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

global.window = {
  location: {
    search: "?test"
  }
};
