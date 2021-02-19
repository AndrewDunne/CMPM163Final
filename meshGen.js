var img = new Image();
img.crossOrigin = 'anonymous';
img.src = 'thing.png';

var canvas = document.getElementById('myCanvas');
var ctx = canvas.getContext('2d');

img.onload = function() {
    ctx.drawImage(img, 0, 0);
};
window.addEventListener('load', function(ev) {
	function invert(){
		const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
		const data = imageData.data;
		for (var i = 0; i < data.length; i += 4) {
			data[i]     = 255 - data[i];     // red
			data[i + 1] = 255 - data[i + 1]; // green
			data[i + 2] = 255 - data[i + 2]; // blue
		}
		ctx.putImageData(imageData, 0, 0);
	}

	var button = document.querySelector('button');
		button.addEventListener('click', invert, false);
},false);
