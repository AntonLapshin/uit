require(['droplet', 'game', 'plugins/localization'], function(Droplet, game, strings){

    Droplet.Instance.prototype.game = game;
    Droplet.Instance.prototype.strings = strings;

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
        if (p[0] === 'strings'){
            p.shift();
            target = getTarget(strings, p);
            bind(target, method);
        }
        else if (p[0] !== 'data'){
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
            target.on('change', method);
            method(target());
        }
        else
            method(target);
    }

    function unbind(target, method){
        if (target.off)
            target.off('change', method);        
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
        fire: function($e, eventName){
            var self = this;
            $e.click(function(){
                self.game.fire(eventName);
            });            
        },
        place: function($e, value){
            $e.attr('data-placement', value);
        },
        prop: function($e, value){
            this['$' + value] = $e;
        },
    }

    Droplet.addExtension(function(prototype){
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

});