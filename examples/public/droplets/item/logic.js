Droplet.define('item', [], function(){
	
	var self = this;

	self.click = function(){
		self.parent && self.parent.select(self.data.id);
	};

	self.on('set', function(data){
		Droplet.loadImage(data.src).then(function(){
			self.$thumbnail.attr('src', data.src);
		});
	});

	self.on('test', function(){
		var data = {
			id: 0,
			name: 'Demo Image',
			desc: 'Test description',
			src: 'http://lorempixel.com/889/500/nature/'
		};
		self.set(data).show();
	})

});