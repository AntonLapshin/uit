Droplet.define('gallery', ['item'], function(){
	
	var self = this;

	self.on('set', function(data){
		Droplet.appendList(self, self.$items, 'item', data.items);
	});

	self.on('test', function(){
		$.get('http://beta.json-generator.com/api/json/get/N16M8W6ox', function(data){
			self.set(data).show();
		});
	})

});