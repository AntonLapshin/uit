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

    return {
        
        //
        // Droplet class. For extend.
        //
        Instance: Instance,

        //
        // Defines a new droplet
        // @args[0] is name
        // @args[1] is array of dependecies
        // @args[2] is constructor of a droplet
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
        },

        //
        // Loads and appends a droplet into $container
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

            this.append(dropletName, container).then(function(instance){
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
        },

        //
        // Unubscribes from Droplet events
        //
        off: function(event, el){
            if (!_events.hasOwnProperty(event)) {
                return;
            }
            var index = _events[event].indexOf(el);
            _events[event].splice(index, 1);
        },        

        //
        // Fires an event
        //
        fire: function(event, args){
            if (!_events.hasOwnProperty(event))
                return;

            $.each(_events[event], function(i, el){
                el(args);
            });
        },

        //
        // Adds an extensiton to the Droplet
        //
        addExtension: function(extension){
            _extensions.push(extension);
        },

        //
        // Overrides default options
        // 
        setOptions: function(options){
            if (options.baseUrl)
                options.baseUrl = options.baseUrl + '/{0}/';
            _options = $.extend(_options, options);
        }

    };

}));
