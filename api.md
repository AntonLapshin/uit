## Constants

<dl>
<dt><a href="#event">event</a></dt>
<dd><p>PubSub instance</p>
</dd>
<dt><a href="#ob">ob</a></dt>
<dd><p>Observable class</p>
</dd>
</dl>

## Functions

<dl>
<dt><a href="#define">define(name, deps, Logic)</a></dt>
<dd><p>Defines a new component (block)</p>
</dd>
<dt><a href="#append">append(name, container)</a> ⇒ <code>Promise</code></dt>
<dd><p>Loads and appends a droplet into container</p>
</dd>
<dt><a href="#run">run(container)</a> ⇒ <code>Promise</code></dt>
<dd><p>Runs the environment by the selected block via search string</p>
</dd>
<dt><a href="#addExtension">addExtension(extension)</a> ⇒ <code>object</code></dt>
<dd><p>Adds an extension to the block&#39;s instance</p>
</dd>
</dl>

<a name="event"></a>

## event
PubSub instance

**Kind**: global constant  
<a name="ob"></a>

## ob
Observable class

**Kind**: global constant  
<a name="define"></a>

## define(name, deps, Logic)
Defines a new component (block)

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | Name of the block |
| deps | <code>Array</code> | List of all dependencies |
| Logic | <code>function</code> | Logic of the component |

<a name="append"></a>

## append(name, container) ⇒ <code>Promise</code>
Loads and appends a droplet into container

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | Name of the block |
| container | <code>selector</code> \| <code>string</code> \| <code>Element</code> | Container |

<a name="run"></a>

## run(container) ⇒ <code>Promise</code>
Runs the environment by the selected block via search string

**Kind**: global function  

| Param | Type |
| --- | --- |
| container | <code>selector</code> \| <code>string</code> \| <code>Element</code> | 

<a name="addExtension"></a>

## addExtension(extension) ⇒ <code>object</code>
Adds an extension to the block's instance

**Kind**: global function  
**Returns**: <code>object</code> - uit instance  

| Param | Type |
| --- | --- |
| extension | <code>function</code> | 

