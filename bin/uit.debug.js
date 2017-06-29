(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.uitDebug = global.uitDebug || {})));
}(this, (function (exports) { 'use strict';

const styleTemplate = `
  <style>
    body {
      margin-right: 40%;
    }

    #jsoneditor {
      background-color: #fafafa;
      width: 100%;
      height: 100%;
    }

    #jsoneditor input {
      position: relative;
      opacity: 1;
      left: 0;
      vertical-align: bottom;
    }

    .debug {
      height: 100%;
      width: 40%;
      position: fixed;
      z-index: 1;
      top: 0;
      right: 0;
    }
  </style>
`;

const debugTemplate = `
  <div class="debug">
    <div id="jsoneditor"></div>
  </div>      
`;

const debounce = (func, wait, immediate) => {
  let timeout;
  return function() {
    const context = this;
    const args = arguments;
    const later = function() {
      timeout = null;
      if (!immediate) {
        func.apply(context, args);
      }
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) {
      func.apply(context, args);
    }
  };
};

const append = (el, html) => {
  const temp = document.createElement("div");
  temp.innerHTML = html;
  el.appendChild(temp.firstChild);
  el.appendChild(temp.firstChild);
};

const debug = instance => {
  append(document.getElementsByTagName("head")[0], styleTemplate);
  return Promise.all([
    window.uit.load(
      "https://cdnjs.cloudflare.com/ajax/libs/jsoneditor/5.7.2/jsoneditor.min.js"
    ),
    window.uit.load(
      "https://cdnjs.cloudflare.com/ajax/libs/jsoneditor/5.7.2/jsoneditor.min.css"
    )
  ]).then(() => {
    append(document.getElementsByTagName("body")[0], debugTemplate);
    const container = document.getElementById("jsoneditor");
    const editor = new window.JSONEditor(container, {
      mode: "tree",
      onChange: debounce(() => {
        const data = editor.get();
        instance.set(data);
      }, 300)
    });
    instance.once("set", data => {
      editor.set(data);
    });

    instance.test();
    return instance;
  });
};

exports.debug = debug;

Object.defineProperty(exports, '__esModule', { value: true });

})));
