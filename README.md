# CMPM163Final

This program takes an image as input, and creates an even-width prism mesh using the input's silhouette and texture.
Edge detection part of program by Casey Moropoulos.

### Usage
- Run this program through a web server, eg 'Web server for Chrome'
- Input image should contain a homogenous object surrounded by blank space of any color.
- Mesh resolution = Image resolution/geometry spacing, so set the geometry spacing accordingly. High resolution+low geometry spacing can take a while and even crash the program.
- To use an image, the image must be placed in testImages folder, and the file name should be entered in lines 3 and 319 on OmegaScript.js.
- Click 'Generate Mesh' in the top right to generate the mesh.

Has a runtime of O(xye + v^2) where x & y are the image width and height, e is the number of edges found, and v is the number of vertices generated.

Email amdunne@ucsc.edu for questions
