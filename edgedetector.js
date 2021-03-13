var img = new Image();
img.crossOrigin = 'anonymous';
img.src = 'tomsface.jpg';
var canvas = document.getElementById('canvas');
var TheCanvas = canvas.getContext('2d');

const monoValue = (r,g,b) => (r + g + b) / 3;

function rgbValue(img, x, y, c)     // 'c' for RGBA channel
{
    return img.data[((y * (4 * img.width)) + (4 * x)) + c];
}

function setMonochrome(img, x, y, v)  // 'v' for value
{
	img.data[((y * (4 * img.width)) + (4 * x)) + 0] = v;
	img.data[((y * (4 * img.width)) + (4 * x)) + 1] = v;
	img.data[((y * (4 * img.width)) + (4 * x)) + 2] = v;
}

function pxlValue(img, x, y)  // we just read the 'red' value
{
    return img.data[((y * (4 * img.width)) + (4 * x))];
}

function setRGB(img, x, y, rgb)
{
	img.data[((y * (4 * img.width)) + (4 * x)) + 0] = rgb[0];
	img.data[((y * (4 * img.width)) + (4 * x)) + 1] = rgb[1];
	img.data[((y * (4 * img.width)) + (4 * x)) + 2] = rgb[2];
	img.data[((y * (4 * img.width)) + (4 * x)) + 3] = 255;
}


function edgeDetect(img, x, y)
{
	var gradX = 0;
	var gradY = 0;

	gradX += pxlValue(img, x-1, y-1) * -2;
	gradX += pxlValue(img, x-1, y+0) * -4;
	gradX += pxlValue(img, x-1, y+1) * -2;
	gradX += pxlValue(img, x+1, y-1) *  2;
	gradX += pxlValue(img, x+1, y+0) *  4;
	gradX += pxlValue(img, x+1, y+1) *  2;

	gradY += pxlValue(img, x-1, y-1) * -2;
	gradY += pxlValue(img, x+0, y-1) * -4;
	gradY += pxlValue(img, x+1, y-1) * -2;
	gradY += pxlValue(img, x-1, y+1) *  2;
	gradY += pxlValue(img, x+0, y+1) *  4;
	gradY += pxlValue(img, x+1, y+1) *  2;

	gradX /= 9;
	gradY /= 9;

	return Math.sqrt(Math.pow(gradX, 2) + Math.pow(gradY, 2));
}




img.onload = function() {
  TheCanvas.drawImage(img, 0, 0);
  img.style.display = 'none';
  let pixels = TheCanvas.getImageData(0, 0, 340, 1350);
  let buffer = TheCanvas.createImageData(pixels);


	for (let x = 1; x < 340; x++)
	{
		for (let y = 1; y < 1350; y++)
		{
			let r = rgbValue(pixels, x, y, 0);
			let g = rgbValue(pixels, x, y, 1);
			let b = rgbValue(pixels, x, y, 2);
			setMonochrome(pixels, x, y, monoValue(r, g, b));
		}
	}

for (let x = 1; x < 340; x++)
	{
		for (let y = 1; y < 1350; y++)
		{
			let v = edgeDetect(pixels, x, y)*7;
			setRGB(buffer, x,y, [v,v,v]);
		}
	}


	TheCanvas.putImageData(buffer, 0, 0);


};





var hoveredColor = document.getElementById('hovered-color');
var selectedColor = document.getElementById('selected-color');


function pick(event, destination) {
  var x = event.layerX;
  var y = event.layerY;
  var pixel = TheCanvas.getImageData(x, y, 1, 1);
  var data = pixel.data;

	const rgba = `rgba(${data[0]}, ${data[1]}, ${data[2]}, ${data[3] / 255})`;
	destination.style.background = rgba;
	destination.textContent = rgba;

	return rgba;
}

canvas.addEventListener('mousemove', function(event) {
	//pick(event, hoveredColor);
});
canvas.addEventListener('click', function(event) {
	//pick(event, selectedColor);
});