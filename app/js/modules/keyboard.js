
function KeyBoardModel() {
	var self = this;

	$.observable(self);

	KeyboardJS.on('ctrl + m', function() {
	    console.log('ctrl m!');
	});
}

module.exports = KeyBoardModel;