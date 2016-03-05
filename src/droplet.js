/*
 *
 * Droplet.JS
 * Depends on jQuery 
 *
 */
;(function (root, factory) {

    if (typeof define === "function" && define.amd) {
        define(["jquery"], factory);
    } 
    else if (typeof module === "object" && module.exports) {
        module.exports = factory(require("jquery"));
    } 
    else {
        root.Droplet = factory(root.$);
    }

}(this, function($) {
    
    String.prototype.f = function() {
        var args = arguments;
        return this.replace(/{(\d+)}/g, function(match, number) { 
            return typeof args[number] != 'undefined'
                ? args[number]
                : match
            ;
        });
    };

    var _instances = {},
        _extensions = [],    
        _events = {},
        _droplets = {},
        _views = {},
        _styles = {},
        _images = {},
        _scripts = {},
        _options = {
            baseUrl: './droplets/{0}/',
            timeout: 2000
        };

    function getName(parentName, dropletName){
        return '{0}{1}'.f(
            (parentName ? parentName + '+' : ''), 
            dropletName
        );            
    }

    var Instance = (function(){
        function IEvents(){
            this.events = {};
        }

        IEvents.prototype = {
            on: function(event, el){
                if (!this.events.hasOwnProperty(event)) {
                    this.events[event] = [];
                }
                this.events[event].push(el);
            },
            fire: function(event, args){
                if (this.events.hasOwnProperty(event)) {
                    $.each(this.events[event], function(i, el){
                        el(args);
                    });
                }
            }
        }

        function IDroplet(dropletName, name, constructor, $droplet){
            this.dropletName = dropletName;
            this.name = name;
            this.$all = $droplet.find('*').not('[data-droplet]');
            this.$droplet = $droplet;
            this.children = {};

            constructor(this);
        }

        IDroplet.prototype = {
            set: function(data){
                this.fire('set', data);
                this.data = data;
                return this; 
            },
            load: function(){
                this.fire('load');
                return this; 
            },
            show: function(){
                this.$droplet.show();
                this.fire('show');
                return this;
            },
            hide: function(){
                this.$droplet.hide();
                this.fire('hide');
                return this;
            },
            test: function(){
                this.$droplet.hide();
                this.fire('test');
                return this;
            }     
        }

        function Instance(dropletName, name, constructor, $droplet){
            IEvents.call(this);
            IDroplet.call(this, dropletName, name, constructor, $droplet);

            var self = this;
            $.each(_extensions, function(i, extension){
                extension.call(self);
            });  

            return this;
        }

        Instance.prototype = $.extend(
            {},
            IEvents.prototype,
            IDroplet.prototype
        );
        Instance.prototype.constructor = Instance;

        return Instance;
    })();

    function build($droplet){
        var defer = $.Deferred();

        var dropletName = $droplet.attr('data-droplet');
        var droplet = _droplets[dropletName];
        var $parent = $droplet.parents('[data-droplet]').eq(0);
        var parentName = $parent.attr('data-name');
        var dropletCall = $droplet.attr('data-call');
        var name = getName(parentName, dropletName);
        var parent, index;

        if (parentName){
            parent = _instances[parentName];
            if (dropletCall === 'byIndex'){
                if (!parent.children[dropletName])
                    parent.children[dropletName] = [];
                index = parent.children[dropletName].length;
                name += '[{0}]'.f(index);
            }
            else if (dropletCall !== ''){
                if (!parent.children[dropletName])
                    parent.children[dropletName] = {};
                name += '[{0}]'.f(dropletCall);                    
            }
        }                

        $droplet
            .addClass(dropletName)
            .attr('data-ready', true)
            .attr('data-name', name)
            .hide()
            .html(droplet.view);

        var instance = new Instance(dropletName, name, droplet.constructor, $droplet);
        _instances[name] = instance;

        if (parentName){
            var parent = _instances[parentName];
            if (index !== undefined){
                parent.children[dropletName].push(instance);
            }
            else if (dropletCall){
                parent.children[dropletName][dropletCall] = instance;
            }
            else {
                parent.children[dropletName] = instance;
            }
            instance.parent = parent;
        }

        lookup($droplet).then(function(){
            instance.load();        
            defer.resolve(instance);
        });

        return defer;
    }

    //
    // Lookup for droplet inside of the container
    //
    function lookup($container){
        $container = $container || $('body');
        var $droplets = $container.find('[data-droplet]').not('[data-ready]');

        if ($droplets.length === 0){
            var defer = $.Deferred();
            defer.resolve();
            return defer;
        }

        var defers = [];
        $droplets.each(function(){
            var $droplet = $(this);
            defers.push(build($droplet));
        });

        return $.when.apply(this, defers);
    }

    function append(container, dropletName, html){
        var $container = $(container);
        return loadDroplet(dropletName).then(function(){
            var $container = $(container);
            $container.append(html);
            return lookup($container);                
        });
    }

    function loadDeps(name, deps){
        if (!deps || deps.length === 0){
            var defer = $.Deferred();
            defer.resolve();
            return defer;
        }

        var baseUrl = _options.baseUrl.f(name);
        var defers = [];        
        $.each(deps, function(i, dep){
            var url = baseUrl + dep;

            if (url.endsWith('.jpg') || url.endsWith('png'))
                defers.push(loadImage(url));
            else if (url.endsWith('.html'))
                defers.push(loadView(url));
            else if (url.endsWith('.css'))
                defers.push(loadStyle(url));
            else if (url.endsWith('.js'))
                defers.push(loadScript(url));            
            else 
                defers.push(loadDroplet(url.split('/').pop()));
        });

        return $.when.apply(this, defers);
    }

    function loadImage(url) {
        var defer = $.Deferred();

        if (_images[url]){
            defer.resolve(_images[url]);
            return defer;
        }

        var $img = $('<img />')
            .on('load', function () {
                _images[url] = $img;
                defer.resolve($img);
            })
            .attr('src', url);

        setTimeout(function(){
            _images[url] = true;
            defer.resolve($img);                
        }, _options.timeout);

        return defer;
    }

    function loadView(url){
        var defer = $.Deferred();

        if (_views[url] || window.production){
            defer.resolve(_views[url]);
            return;
        }

        $('<div />').load(url, function(response, status, xhr){
            if (status !== 'success')
                throw 'Cannot load the view: {0}'.f(url);

            _views[url] = response;
            defer.resolve(response);
        });            

        return defer;  
    }

    function loadStyle(url){
        var defer = $.Deferred();

        if (_styles[url] || window.production){
            defer.resolve(_styles[url]);
            return defer;
        }

        $('<link rel="stylesheet" type="text/css" href="{0}" />'.f(url)).appendTo("head");
        _styles[url] = true;
        defer.resolve();

        return defer;         
    }

    function loadJS(url) {
        var defer = $.Deferred();

        var script = document.createElement("script")
        script.type = "text/javascript";

        if (script.readyState) { // IE
            script.onreadystatechange = function () {
                if (script.readyState == "loaded" || script.readyState == "complete") {
                    script.onreadystatechange = null;
                    defer.resolve();
                }
            };
        } else { // Others
            script.onload = function () {
                defer.resolve();
            };
        }

        script.src = url;
        document.getElementsByTagName("head")[0].appendChild(script);

        return defer;
    }

    function loadScript(url){
        var defer = $.Deferred();

        if (_scripts[url]){
            defer.resolve(_scripts[url]);
            return defer;
        }

        if (window.require){
            require([url.substr(0, url.length - 3)], function(script){
                _scripts[url] = script;
                defer.resolve(script);
            });
        }
        else {
            loadJS(url).then(function(){
                _scripts[url] = true;
                defer.resolve();
            });
        }          

        return defer;
    }

    //
    // Loads logic + view + style. The define method calls after loading
    //
    function loadDroplet(name){
        if (_droplets[name]){
            var defer = $.Deferred();
            defer.resolve(_droplets[name]);
            return defer;
        }

        var droplet = {
            name: name,
            deps: null            
        };
        _droplets[name] = droplet;

        var logicDefer = $.Deferred();
        Droplet.on('{0}.load'.f(name), function(droplet){
            logicDefer.resolve(droplet);
        });

        var depsDefer = $.Deferred();
        loadDeps(name, ['view.html', 'style.css', 'logic.js']).then(function(view){
            droplet.view = view;
            depsDefer.resolve();
        })

        return $.when.apply(this, [logicDefer, depsDefer]);
    }

    //
    // Observable end extension
    // ----------------------------------------
    //

    function handleMethod(path, method){
        var self = this;
        var target;

        if (Array.isArray(path)){
            $.each(path, function(i, pathItem){
                handleMethod.call(self, pathItem, method);
            });
            return;
        }

        var p = path.split('.');
        if (p[0] !== 'data'){
            target = getTarget(self, p);
            bind(target, method);                
        }
        else {
            p.shift();
            self.on('set', function(data){
                if (self.data){
                    target = getTarget(self.data, p);
                    unbind(target, method);
                }
                target = getTarget(data, p);
                bind(target, method);
            });
        }
    }

    Instance.prototype.bind = handleMethod;

    function getTarget(ctx, p){
        var val = ctx;
        $.each(p, function(i, name){
            val = val[name];
        });        
        return val;
    }

    function bind(target, method){
        if (target.on){
            target.on(method);
            method(target()); 
        }
        else
            method(target);
    }

    function unbind(target, method){
        if (target.off)
            target.off(method);        
    }

    function getv(v){
        if (v == null)
            return v;

        return v.on ? v() : v;
    }

    var RULES = {
        title: function($e, path){
            $e.attr({
                'data-toggle': 'tooltip',
                'data-placement': 'bottom'
            });
            window.setTimeout(function () {
                $e.tooltip();
            }, 0);            

            handleMethod.call(this, path, function(v){
                $e.attr('title', getv(v));
            });
        },
        src: function($e, path){
            handleMethod.call(this, path, function(v){
                $e.attr('src', getv(v));
            });
        },        
        text: function($e, path){
            handleMethod.call(this, path, function(v){
                $e.text(getv(v));
            });
        },
        val: function($e, path){
            handleMethod.call(this, path, function(v){
                $e.val(getv(v));
            });
        },        
        html: function($e, path){
            handleMethod.call(this, path, function(v){
                $e.html(getv(v));
            });
        }, 
        visible: function($e, path){
            handleMethod.call(this, path, function(v){
                $e[!getv(v) ? 'hide' : 'show']();
            });            
        },  
        invisible: function($e, path){
            handleMethod.call(this, path, function(v){
                $e[!getv(v) ? 'show' : 'hide']();
            });            
        },
        enable: function($e, path){
            handleMethod.call(this, path, function(v){
                $e.toggleClass('disabled', !getv(v));
            });
        },
        click: function($e, methodName){
            var self = this;
            $e.click(function(){
                self[methodName].call(self, $e);
            });            
        },
        place: function($e, value){
            $e.attr('data-placement', value);
        },
        prop: function($e, value){
            this['$' + value] = $e;
        },
    }

    var Droplet = window.Droplet = {
        
        //
        // Droplet class. For extend.
        //
        Instance: Instance,

        //
        // Defines a new droplet
        // @param args[0] is name
        // @param args[1] is array of dependecies
        // @param args[2] is constructor of a droplet
        //
        define: function(){
            var name = arguments[0];
            var deps = arguments[1];
            var Logic = arguments[2];
            
            var droplet = _droplets[name];

            loadDeps(name, deps).then(function(){
                droplet.deps = arguments;
                droplet.constructor = function(context){
                    Logic.apply(context, droplet.deps);
                };
                Droplet.fire('{0}.load'.f(name), droplet);
            });

            return this;
        },

        //
        // Loads and appends a droplet into container
        // @dropletName is name of the droplet
        // @container is a css selector or $ object. Place where the droplet should be inserted
        //
        append: function (dropletName, container){
            return append(container, dropletName, '<div data-droplet="{0}"></div>'.f(dropletName));
        },

        //
        // Appends list into $ul container
        // @parent is owner droplet context 
        // @$ul is html container for the list
        // @dropletName is name of the droplet items
        // @isHide if it's need to hide items
        //
        appendList: function(parent, container, dropletName, items, isHide){
            var html = '';
            var item = '<li data-droplet="{0}" data-call="byIndex"></li>'.f(dropletName);
            for(var i = 0; i < items.length; i++){
                html += item;
            }
            return append(container, dropletName, html).then(function(){
                $.each(items, function(i, item){
                    parent.children[dropletName][i].set(item);
                    !isHide && parent.children[dropletName][i].show();
                });                
            });
        },

        run: function(container){
            var search = window.location.search,
                dropletName = search.length > 0 ? search.substring(1) : null;

            return this.append(dropletName, container).then(function(instance){
                instance.test();
            });          
        },

        //
        // Loads a droplet by name
        // @name is name of the droplet
        //
        loadDroplet: loadDroplet,
        
        //
        // Loads an image
        //
        loadImage: loadImage,

        //
        // Subscribes on Droplet events
        //
        on: function(event, el){
            if (!_events.hasOwnProperty(event)) {
                _events[event] = [];
            }
            _events[event].push(el);
            return this;
        },

        //
        // Unubscribes from Droplet events
        //
        off: function(event, el){
            if (!_events.hasOwnProperty(event)) {
                return this;
            }
            var index = _events[event].indexOf(el);
            _events[event].splice(index, 1);
            return this;
        },        

        //
        // Fires an event
        //
        fire: function(event, args){
            if (!_events.hasOwnProperty(event))
                return this;

            $.each(_events[event], function(i, el){
                el(args);
            });
            return this;
        },

        //
        // Adds an extensiton to the Droplet
        //
        addExtension: function(extension){
            _extensions.push(extension);
            return this;
        },

        //
        // Overrides default options
        // 
        setOptions: function(options){
            if (options.baseUrl)
                options.baseUrl = options.baseUrl + '/{0}/';
            _options = $.extend(_options, options);
            return this;
        }

    };

    Droplet.observable = (function(){

        var _subs = [];
        var _index = 0;

        function on(uid, handler){
            var hs = _subs[uid];
            if (!hs){
                hs = [];
                _subs[uid] = hs;
            }

            hs.push(handler);
        }

        function off(uid, handler){
            var hs = _subs[uid];
            if (!hs)
                return;

            var i = hs.indexOf(handler);
            hs.splice(i, 1);
        }

        function fire(uid, data, oldData){
            var hs = _subs[uid];
            if (!hs)
                return;

            hs.forEach(function(h){
                h(data, oldData);
            });
        }

        return function(data){
            var _data = data;
            var _uid = _index++;

            var Observable = function(data){
                if (data === undefined)
                    return _data;

                var oldData = _data;
                _data = data;
                fire(_uid, data, oldData);
            };

            Observable.on = function(h){
                on(_uid, h);
            };
            Observable.off = function(h){
                off(_uid, h);
            }
            
            return Observable;
        };

    })();

    //
    // Adds one-way data binding
    // Example: <div data-bind="title: data.title"></div>
    //
    Droplet.addExtension(function(){
        var self = this;
        self.$all.filter('[data-bind]').each(function(){
            var $e = $(this);
            var statements = $e.data('bind').split(',');
            $.each(statements, function(i, statement){
                var parts = statement.split(':');
                var key = parts[0].trim();
                var value = parts[1].trim();
                RULES[key].call(self, $e, value, statement);
            });
        });
    }); 
    
    return Droplet;   

}));
