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
            this.$droplet = $droplet;
            this.$all = $droplet.find('*').not('[data-droplet]');
            this.$view = $droplet.children().first();
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

        var dropletName = $droplet[0].nodeName.toLowerCase();
        var droplet = _droplets[dropletName];
        var $parent = $droplet.closest('[data-ready]');
        var parentName = $parent.attr('data-name');
        var dropletNameSpec = $droplet.attr('data-droplet');
        var name = getName(parentName, dropletName);
        var parent, index;

        if (parentName){
            parent = _instances[parentName];
            if (dropletNameSpec === 'li'){
                if (!parent.children[dropletName])
                    parent.children[dropletName] = [];
                index = parent.children[dropletName].length;
                name += '[{0}]'.f(index);
            }
            else if (dropletNameSpec !== ''){
                if (!parent.children[dropletName])
                    parent.children[dropletName] = {};
                name += '[{0}]'.f(dropletNameSpec);                    
            }
        }                

        $droplet
            .attr('data-name', name)
            .attr('data-ready', true)
            .hide()
            .html(droplet.view);

        var instance = new Instance(dropletName, name, droplet.constructor, $droplet);
        _instances[name] = instance;

        if (parentName){
            var parent = _instances[parentName];
            if (index !== undefined){
                parent.children[dropletName].push(instance);
            }
            else if (dropletNameSpec){
                parent.children[dropletName][dropletNameSpec] = instance;
            }
            else {
                parent.children[dropletName] = instance;
            }
            instance.parent = parent;
            var eventHandler = parent['{0}Loaded'.f(dropletName)];
            if (eventHandler)
                eventHandler(instance);
        }

        lookup($droplet).then(function(){
            instance.load();        
            defer.resolve();
        });

        return defer;
    }

    function lookup($container, dropletName){
        var defer = $.Deferred();

        $container = $container || $('body');

        var $droplets = $container.find('{0}[data-droplet]'.f(dropletName || ''));

        var defers = [];
        $droplets.each(function(){
            var $droplet = $(this);
            defers.push(build($droplet));
        });

        if ($droplets.length === 0){
            defer.resolve();
            return defer;
        }

        $.when.apply(this, defers).then(function(){
            defer.resolve();
        });

        return defer;
    }

    function genListHtml(dropletName, num){
        var html = '';
        var item = '<{0} data-droplet="li"></{0}>'.f(dropletName);
        for(var i = 0; i < num; i++){
            html += item;
        }
        return html;
    };

    function buildAndLookup($container, dropletName){
        var defer = $.Deferred();

        $container.append('<{0} data-droplet></{0}>'.f(dropletName));
        lookup($container, dropletName).then(function(){
            var name = $container.find('> {0}[data-ready]'.f(dropletName)).attr('data-name');
            var instance = _instances[name];
            defer.resolve(instance);
        });

        return defer;
    }

    function loadDeps(name, deps){
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

        url = url.substr(0, url.length - 3);
        if (_scripts[url]){
            defer.resolve(_scripts[url]);
            return defer;
        }

        if (require){
            require([url], function(script){
                _scripts[url] = script;
                defer.resolve(script);
            });
        }
        else {
            // TODO: Implement jQuery loading
            throw 'Loading js dependecies is not implemented';
        }          

        return defer;
    }

    function loadDroplet(name){
        var defer = $.Deferred();

        if (_droplets[name]){
            defer.resolve(_droplets[name]);
            return defer;
        }

        var url = _options.baseUrl.f(name) + 'logic.js';   
        Droplet.on('{0}.onload'.f(name), function(droplet){
            defer.resolve(droplet);
        });

        loadJS(url).then(function(){
            _scripts[url] = true;
        });

        return defer;
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
            var view, name, deps, Logic;

            deps = deps || [];   

            name = arguments[0];
            deps = arguments[1];
            Logic = arguments[2];
            
            deps.push('view.html'); 
            deps.push('style.css');

            if (_droplets[name]){
                return;
            }

            loadDeps(name, deps).then(function(){
                var droplet = {
                    deps: arguments,
                    view: view || arguments[arguments.length - 2],
                    name: name
                }
                _droplets[name] = droplet;                
                droplet.constructor = function(context){
                    Logic.apply(context, droplet.deps);
                };
                Droplet.fire('{0}.onload'.f(name), droplet);
            });
        },

        //
        // Loads and appends a droplet into $container
        // @name is name of the droplet
        // @container is a css selector or $ object. Place where the droplet should be inserted
        //
        append: function (name, container){
            var defer = $.Deferred();

            var $container = $(container);
            
            if (_droplets[name]){
                buildAndLookup($container, name).then(defer.resolve);
                return defer;
            }

            loadDroplet(name).then(function(){
                buildAndLookup($container, name).then(defer.resolve);
            });

            return defer;
        },

        //
        // Appends list into $ul container
        // @parent is owner droplet context 
        // @$ul is html container for the list
        // @dropletName is name of the droplet items
        // @isHide if it's need to hide items
        //
        buildList: function(parent, $ul, dropletName, items, isHide){
            var defer = $.Deferred();

            var html = genListHtml(dropletName, items.length);
            $ul.html(html);
            lookup($ul).then(function(){
                $.each(items, function(i, item){
                    parent.children[dropletName][i].set(item);
                    if (!isHide)
                        parent.children[dropletName][i].show();
                });
                defer.resolve();
            });

            return defer;
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
