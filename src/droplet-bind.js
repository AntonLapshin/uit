/*
 *
 * Droplet.JS Bind Extension
 * Depends on Droplet
 *
 */
;(function (root, factory) {

    if (typeof define === "function" && define.amd) {
        define(["Droplet"], factory);
    } 
    else if (typeof module === "object" && module.exports) {
        module.exports = factory(require("Droplet"));
    } 
    else {
        root.DropletBind = factory(root.Droplet);
    }

}(this, function(Droplet) {

    //
    // Observable implementation
    //
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

    Droplet.Instance.prototype.bind = handleMethod;

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

}));