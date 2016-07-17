Droplet.define('gallery', ['item'], function() {

  var self = this;

  self.on('load', function() {
    self.$droplet.on('click', '.item', function() {
      $(this).toggleClass('selected');
    });
  });

  self.on('set', function(data) {
    Droplet.appendList(self, self.$items, 'item', data.items);
  });

  self.on('test', function() {
    $.get('mock.json', function(data) {
      self.set(data).show();
    });
  })

});