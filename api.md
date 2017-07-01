## Classes

<dl>
<dt><a href="#Component">Component</a></dt>
<dd><p>Component&#39;s instance implementation</p>
</dd>
<dt><a href="#Component">Component</a></dt>
<dd></dd>
<dt><a href="#PubSub">PubSub</a></dt>
<dd><p>Typical PubSub implementation</p>
</dd>
</dl>

## Constants

<dl>
<dt><a href="#load">load</a> ⇒ <code>Promise</code></dt>
<dd><p>Loads an external resource</p>
</dd>
<dt><a href="#lookup">lookup</a> ⇒ <code>Promise</code></dt>
<dd><p>Lookup for components inside of the container</p>
</dd>
<dt><a href="#event">event</a></dt>
<dd><p>PubSub instance</p>
</dd>
<dt><a href="#rules">rules</a></dt>
<dd><p>List of predefined rules</p>
</dd>
</dl>

## Functions

<dl>
<dt><a href="#dataBind">dataBind()</a></dt>
<dd><p>Data-binding feature implementation</p>
</dd>
<dt><a href="#build">build(el)</a> ⇒ <code>Promise</code></dt>
<dd><p>Builds a component based on element. Creates a new component instance</p>
</dd>
<dt><a href="#define">define(name, deps, Logic)</a></dt>
<dd><p>Defines a new component</p>
</dd>
<dt><a href="#append">append(el, name)</a> ⇒ <code>Promise.&lt;Array.&lt;Component&gt;&gt;</code></dt>
<dd><p>Loads and appends a droplet into container</p>
</dd>
<dt><a href="#run">run(el)</a> ⇒ <code>Promise.&lt;Array.&lt;Component&gt;&gt;</code></dt>
<dd><p>Runs the environment by a selected component via search string</p>
</dd>
</dl>

<a name="Component"></a>

## Component
Component's instance implementation

**Kind**: global class  

* [Component](#Component)
    * [new Component(name, path, el, logic)](#new_Component_new)
    * [.set(data)](#Component+set) ⇒ [<code>Component</code>](#Component)
    * [.load()](#Component+load) ⇒ [<code>Component</code>](#Component)
    * [.show()](#Component+show) ⇒ [<code>Component</code>](#Component)
    * [.hide()](#Component+hide) ⇒ [<code>Component</code>](#Component)
    * [.test()](#Component+test) ⇒ [<code>Component</code>](#Component)

<a name="new_Component_new"></a>

### new Component(name, path, el, logic)
Creates a component's instance


| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | Name of the component |
| path | <code>string</code> | The full path of the component |
| el | <code>Element</code> | DOM element |
| logic | <code>function</code> | Custom logic of the component |

<a name="Component+set"></a>

### component.set(data) ⇒ [<code>Component</code>](#Component)
Sets data to the component instance

**Kind**: instance method of [<code>Component</code>](#Component)  
**Returns**: [<code>Component</code>](#Component) - instance  

| Param | Type |
| --- | --- |
| data | <code>object</code> | 

<a name="Component+load"></a>

### component.load() ⇒ [<code>Component</code>](#Component)
Fires load event

**Kind**: instance method of [<code>Component</code>](#Component)  
**Returns**: [<code>Component</code>](#Component) - instance  
<a name="Component+show"></a>

### component.show() ⇒ [<code>Component</code>](#Component)
Shows element

**Kind**: instance method of [<code>Component</code>](#Component)  
**Returns**: [<code>Component</code>](#Component) - instance  
<a name="Component+hide"></a>

### component.hide() ⇒ [<code>Component</code>](#Component)
Hides element

**Kind**: instance method of [<code>Component</code>](#Component)  
**Returns**: [<code>Component</code>](#Component) - instance  
<a name="Component+test"></a>

### component.test() ⇒ [<code>Component</code>](#Component)
Tests element

**Kind**: instance method of [<code>Component</code>](#Component)  
**Returns**: [<code>Component</code>](#Component) - instance  
<a name="Component"></a>

## Component
**Kind**: global class  

* [Component](#Component)
    * [new Component(name, path, el, logic)](#new_Component_new)
    * [.set(data)](#Component+set) ⇒ [<code>Component</code>](#Component)
    * [.load()](#Component+load) ⇒ [<code>Component</code>](#Component)
    * [.show()](#Component+show) ⇒ [<code>Component</code>](#Component)
    * [.hide()](#Component+hide) ⇒ [<code>Component</code>](#Component)
    * [.test()](#Component+test) ⇒ [<code>Component</code>](#Component)

<a name="new_Component_new"></a>

### new Component(name, path, el, logic)
Creates a component's instance


| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | Name of the component |
| path | <code>string</code> | The full path of the component |
| el | <code>Element</code> | DOM element |
| logic | <code>function</code> | Custom logic of the component |

<a name="Component+set"></a>

### component.set(data) ⇒ [<code>Component</code>](#Component)
Sets data to the component instance

**Kind**: instance method of [<code>Component</code>](#Component)  
**Returns**: [<code>Component</code>](#Component) - instance  

| Param | Type |
| --- | --- |
| data | <code>object</code> | 

<a name="Component+load"></a>

### component.load() ⇒ [<code>Component</code>](#Component)
Fires load event

**Kind**: instance method of [<code>Component</code>](#Component)  
**Returns**: [<code>Component</code>](#Component) - instance  
<a name="Component+show"></a>

### component.show() ⇒ [<code>Component</code>](#Component)
Shows element

**Kind**: instance method of [<code>Component</code>](#Component)  
**Returns**: [<code>Component</code>](#Component) - instance  
<a name="Component+hide"></a>

### component.hide() ⇒ [<code>Component</code>](#Component)
Hides element

**Kind**: instance method of [<code>Component</code>](#Component)  
**Returns**: [<code>Component</code>](#Component) - instance  
<a name="Component+test"></a>

### component.test() ⇒ [<code>Component</code>](#Component)
Tests element

**Kind**: instance method of [<code>Component</code>](#Component)  
**Returns**: [<code>Component</code>](#Component) - instance  
<a name="PubSub"></a>

## PubSub
Typical PubSub implementation

**Kind**: global class  

* [PubSub](#PubSub)
    * [.on(eventName, handler)](#PubSub+on) ⇒ <code>number</code>
    * [.fire(eventName, args)](#PubSub+fire) ⇒ <code>boolean</code>
    * [.off(token)](#PubSub+off) ⇒ <code>boolean</code>
    * [.once(eventName, handler)](#PubSub+once)

<a name="PubSub+on"></a>

### pubSub.on(eventName, handler) ⇒ <code>number</code>
Subscribes on event. Adds an event handler to a specific event.

**Kind**: instance method of [<code>PubSub</code>](#PubSub)  
**Returns**: <code>number</code> - _uid of the event handler  

| Param | Type |
| --- | --- |
| eventName | <code>string</code> | 
| handler | <code>function</code> | 

<a name="PubSub+fire"></a>

### pubSub.fire(eventName, args) ⇒ <code>boolean</code>
Calls the event handlers by event name

**Kind**: instance method of [<code>PubSub</code>](#PubSub)  
**Returns**: <code>boolean</code> - true of false if at lease one event handler exists or not  

| Param | Type |
| --- | --- |
| eventName | <code>string</code> | 
| args | <code>object</code> | 

<a name="PubSub+off"></a>

### pubSub.off(token) ⇒ <code>boolean</code>
Unsubscribes the event handler by token

**Kind**: instance method of [<code>PubSub</code>](#PubSub)  
**Returns**: <code>boolean</code> - if successfully unsubscribed  

| Param | Type |
| --- | --- |
| token | <code>number</code> | 

<a name="PubSub+once"></a>

### pubSub.once(eventName, handler)
Subscribes on event only for one execution. Unsibscribes after

**Kind**: instance method of [<code>PubSub</code>](#PubSub)  

| Param | Type |
| --- | --- |
| eventName | <code>string</code> | 
| handler | <code>function</code> | 

<a name="load"></a>

## load ⇒ <code>Promise</code>
Loads an external resource

**Kind**: global constant  

| Param | Type | Description |
| --- | --- | --- |
| url | <code>string</code> | URL of the the external resource |

<a name="lookup"></a>

## lookup ⇒ <code>Promise</code>
Lookup for components inside of the container

**Kind**: global constant  

| Param | Type | Description |
| --- | --- | --- |
| el | <code>Element</code> | Container |

<a name="event"></a>

## event
PubSub instance

**Kind**: global constant  
<a name="rules"></a>

## rules
List of predefined rules

**Kind**: global constant  

* [rules](#rules)
    * [.attr()](#rules.attr)
    * [.prop()](#rules.prop)
    * [.class()](#rules.class)
    * [.src()](#rules.src)
    * [.href()](#rules.href)
    * [.text()](#rules.text)
    * [.val()](#rules.val)
    * [.html()](#rules.html)
    * [.visible()](#rules.visible)
    * [.invisible()](#rules.invisible)
    * [.enable()](#rules.enable)
    * [.disable()](#rules.disable)
    * [.click()](#rules.click)
    * [.ref()](#rules.ref)

<a name="rules.attr"></a>

### rules.attr()
[attr] binding

**Kind**: static method of [<code>rules</code>](#rules)  
<a name="rules.prop"></a>

### rules.prop()
[prop] binding

**Kind**: static method of [<code>rules</code>](#rules)  
<a name="rules.class"></a>

### rules.class()
[class] binding

**Kind**: static method of [<code>rules</code>](#rules)  
<a name="rules.src"></a>

### rules.src()
[src] attribute binding

**Kind**: static method of [<code>rules</code>](#rules)  
<a name="rules.href"></a>

### rules.href()
[href] attribute binding

**Kind**: static method of [<code>rules</code>](#rules)  
<a name="rules.text"></a>

### rules.text()
[text] value binding

**Kind**: static method of [<code>rules</code>](#rules)  
<a name="rules.val"></a>

### rules.val()
[val] binding

**Kind**: static method of [<code>rules</code>](#rules)  
<a name="rules.html"></a>

### rules.html()
[html] content binding

**Kind**: static method of [<code>rules</code>](#rules)  
<a name="rules.visible"></a>

### rules.visible()
[visible] visibility of element binding

**Kind**: static method of [<code>rules</code>](#rules)  
<a name="rules.invisible"></a>

### rules.invisible()
[invisible] visibility of element binding

**Kind**: static method of [<code>rules</code>](#rules)  
<a name="rules.enable"></a>

### rules.enable()
[disabled] class binding

**Kind**: static method of [<code>rules</code>](#rules)  
<a name="rules.disable"></a>

### rules.disable()
[disabled] class binding

**Kind**: static method of [<code>rules</code>](#rules)  
<a name="rules.click"></a>

### rules.click()
[click] binding

**Kind**: static method of [<code>rules</code>](#rules)  
<a name="rules.ref"></a>

### rules.ref()
[ref] adds a link to an element

**Kind**: static method of [<code>rules</code>](#rules)  
<a name="dataBind"></a>

## dataBind()
Data-binding feature implementation

**Kind**: global function  
<a name="build"></a>

## build(el) ⇒ <code>Promise</code>
Builds a component based on element. Creates a new component instance

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| el | <code>Element</code> | Component element |

<a name="define"></a>

## define(name, deps, Logic)
Defines a new component

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | Name of the component |
| deps | <code>Array</code> | List of all dependencies |
| Logic | <code>function</code> | Logic of the component |

<a name="append"></a>

## append(el, name) ⇒ <code>Promise.&lt;Array.&lt;Component&gt;&gt;</code>
Loads and appends a droplet into container

**Kind**: global function  
**Returns**: <code>Promise.&lt;Array.&lt;Component&gt;&gt;</code> - - List of the added component instances  

| Param | Type | Description |
| --- | --- | --- |
| el | <code>selector</code> \| <code>string</code> \| <code>Element</code> | Container |
| name | <code>string</code> | Name of the component |

<a name="run"></a>

## run(el) ⇒ <code>Promise.&lt;Array.&lt;Component&gt;&gt;</code>
Runs the environment by a selected component via search string

**Kind**: global function  
**Returns**: <code>Promise.&lt;Array.&lt;Component&gt;&gt;</code> - - List of the added component instances  

| Param | Type | Description |
| --- | --- | --- |
| el | <code>selector</code> \| <code>string</code> \| <code>Element</code> | Container |

