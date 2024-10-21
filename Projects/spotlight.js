
"use strict";
function run(){
var canvas;
var gl;


var rotating = false;
var numVertices  = 0;

var positionsArray = [];
var colorsArray = [];

var prism_verts = [
        vec4(-0.3, -0.1,  0.5, 1.0), //0
        vec4(-0.3,  0.15,  0.5, 1.0), 
        vec4(0.3,  0.15,  0.5, 1.0),
        vec4(0.3, -0.1,  0.5, 1.0),
        vec4(-0.3, -0.1, -0.75, 1.0),
        vec4(-0.3,  0.15, -0.75, 1.0),
        vec4(0.3,  0.15, -0.75, 1.0),
        vec4(0.3, -0.1, -0.75, 1.0),

        //center indicies
        vec4(0.2, -0.1, -0.125, 1.0), //8
        vec4(-0.2, -0.1, -0.125, 1.0), //9
        vec4(-0.2, 0.15, -0.125, 1.0), //10
        vec4(0.2, 0.15, -0.125, 1.0), //11

        //other wall indicies
        vec4(0.3, -0.1, -0.125, 1.0), //12
        vec4(-0.3, -0.1, -0.125, 1.0), //13
        vec4(-0.3, 0.15, -0.125, 1.0), //14
        vec4(0.3, 0.15, -0.125, 1.0), //15

    ];

var prism_colors = [
        vec4(0.0, 0.0, 0.0, 1.0),  // black
        vec4(1.0, 0.0, 0.0, 1.0),  // red
        vec4(1.0, 1.0, 0.0, 1.0),  // yellow
        vec4(0.0, 1.0, 0.0, 1.0),  // green
        vec4(0.0, 0.0, 1.0, 1.0),  // blue
        vec4(1.0, 0.0, 1.0, 1.0),  // magenta
        vec4(0.0, 1.0, 1.0, 1.0),  // cyan
        vec4(1.0, 1.0, 1.0, 1.0),  // white
    ];

var mouse_down = false;
var t1;

var near = -2;
var far = 2;
var radius = 0.1;
var theta = 0.0;
var phi = 1.0;
var dr = 5.0 * Math.PI/180.0;

var left = -1.0;
var right = 1.0;
var top = 1.0;
var bottom = -1.0;

var modelViewMatrixLoc, projectionMatrixLoc;
var modelViewMatrix, projectionMatrix;
var eye;

const at = vec3(0.0, 0.0, 0.0);
const up = vec3(0.0, 1.0, 0.0);

const eye_positions = [
    vec3(),
    vec3(),
    vec3(),
    vec3(),
    vec3(),
    vec3(),
];

const spotlight_positions = [
    vec3(),
    vec3(),
    vec3(),
    vec3(),
];



// quad uses first index to set color for face

function quad(a, b, c, d, e, prism_verts, x_offset = 0, y_offset = 0, z_offset = 0) {

    /*
        A ----------- D
        |             |
        |             |
        B ----------- C

        ADC and ABC are triangles that form the prism

    */

     positionsArray.push(vec4(prism_verts[a][0] + x_offset, prism_verts[a][1] + y_offset, prism_verts[a][2] + z_offset, 1.0));  
     colorsArray.push(prism_colors[e]);
     positionsArray.push(vec4(prism_verts[b][0] + x_offset, prism_verts[b][1] + y_offset, prism_verts[b][2] + z_offset, 1.0));
     colorsArray.push(prism_colors[e]);
     positionsArray.push(vec4(prism_verts[c][0] + x_offset, prism_verts[c][1] + y_offset, prism_verts[c][2] + z_offset, 1.0));


     colorsArray.push(prism_colors[e]);
     positionsArray.push(vec4(prism_verts[a][0] + x_offset, prism_verts[a][1] + y_offset, prism_verts[a][2] + z_offset, 1.0));
     colorsArray.push(prism_colors[e]);
     positionsArray.push(vec4(prism_verts[c][0] + x_offset, prism_verts[c][1] + y_offset, prism_verts[c][2] + z_offset, 1.0));
     colorsArray.push(prism_colors[e]);
     positionsArray.push(vec4(prism_verts[d][0] + x_offset, prism_verts[d][1] + y_offset, prism_verts[d][2] + z_offset, 1.0));
     colorsArray.push(prism_colors[e]);

     numVertices+=6;
}

// Each face determines two triangles

function colorCube(x_off = 0, y_off = 0, z_off = 0)
{
    quad(1, 0, 3, 2, 0, prism_verts, x_off, y_off, z_off);
    quad(7, 12, 15, 6, 6, prism_verts, x_off, y_off, z_off); 
    quad(3, 0, 4, 7, 1, prism_verts, x_off, y_off, z_off);
    //quad(6, 5, 1, 2, 4, prism_verts); roof
    quad(4, 5, 6, 7, 2, prism_verts, x_off, y_off, z_off);
    quad(5, 4, 0, 1, 3, prism_verts, x_off, y_off, z_off);

}
function colorCube2(x_off = 0, y_off = 0, z_off = 0)
{
    quad(1, 0, 3, 2, 4, prism_verts, x_off, y_off, z_off);
    quad(2, 3, 7, 6, 5, prism_verts, x_off, y_off, z_off); 
    quad(3, 0, 4, 7, 6, prism_verts, x_off, y_off, z_off);
    //quad(6, 5, 1, 2, 4, prism_verts); roof
    quad(4, 5, 6, 7, 0, prism_verts, x_off, y_off, z_off);
    quad(4, 13, 14, 5, 2, prism_verts, x_off, y_off, z_off);

}
function colorCube3(x_off = 0, y_off = 0, z_off = 0)
{
    quad(1, 0, 3, 2, 2, prism_verts, x_off, y_off, z_off);
    //quad(2, 3, 7, 6, 6, prism_verts, x_off, y_off, z_off); 
    quad(9, 8, 3, 0, 3, prism_verts, x_off, y_off, z_off);
    //quad(6, 5, 1, 2, 4, prism_verts); roof
    quad(8, 9, 10, 11, 0, prism_verts, x_off, y_off, z_off);
    //quad(5, 4, 0, 1, 6, prism_verts, x_off, y_off, z_off);

}

var spotlight_pos = vec4(0,1,0);
var camera_pos = vec4(1,1,1);

//makes little cubes
function make_cube(x,y,z,size){
    
   let verts = [
        vec4(x - size,y - size,z + size,1.0),
        vec4(x - size,y + size,z + size,1.0),
        vec4(x + size,y + size,z + size,1.0),
        vec4(x + size,y - size,z + size,1.0),
        vec4(x - size,y - size,z - size,1.0),
        vec4(x - size,y + size,z - size,1.0),
        vec4(x + size,y + size,z - size,1.0),
        vec4(x + size,y - size,z - size,1.0),
   ];

}

window.onload = function init() {
    colorCube();
    colorCube2(1,0,0);
    colorCube3(0.5,0,0);
    
    document.getElementById("gl-canvas").addEventListener("mousedown", function(event){
        var x = event.pageX - canvas.offsetLeft;
        var y = event.pageY - canvas.offsetTop;
        t1 = vec2(2*x/canvas.width-1, 2*(canvas.height-y)/canvas.height-1);

        mouse_down = true;
    });

    document.getElementById("gl-canvas").addEventListener("mouseup", function(event){
        mouse_down = false;
    });

    document.getElementById("gl-canvas").addEventListener("mousemove", function(event){
        if (mouse_down) {
            var x = event.pageX - canvas.offsetLeft;
            var y = event.pageY - canvas.offsetTop;
  
            let t2 = vec2(2*x/canvas.width-1, 2*(canvas.height-y)/canvas.height-1);
                
            let diff_x = t2[0] - t1[0];
            let diff_y = t2[1] - t1[1];
            
            if (diff_x > 0){
                rotate_x(0.1);
            }
            if (diff_x < 0){
                rotate_x(-0.1);
            }
            if (diff_y > 0){
                rotate_y(0.1);
            }
            if (diff_y < 0){
                rotate_y(-0.1);
            }
            t1 = t2;
          }
    });


// buttons to change viewing parameters

    console.log('H');
    render();
}

function rotate_x(num){
    phi+=num
}

function rotate_y(num){
    theta+=num;
}



var render = function() {
        canvas = document.getElementById("gl-canvas");
        if(rotating){
            phi+=0.01;
        }
        gl = canvas.getContext('webgl2');
        if (!gl) alert("WebGL 2.0 isn't available");

        gl.viewport(0, 0, canvas.width, canvas.height);

        gl.clearColor(0.3, 0.3, 0.3, 1.0); // background color
        gl.enable(gl.DEPTH_TEST);

        //
        //  Load shaders and initialize attribute buffers
        //
        var program = initShaders(gl, "vertex-shader", "fragment-shader");
        gl.useProgram(program);

        var cBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(colorsArray), gl.STATIC_DRAW);

        var colorLoc = gl.getAttribLocation(program, "aColor");
        gl.vertexAttribPointer(colorLoc, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(colorLoc);

        var vBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(positionsArray), gl.STATIC_DRAW);

        var positionLoc = gl.getAttribLocation(program, "aPosition");
        gl.vertexAttribPointer(positionLoc, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(positionLoc);

        modelViewMatrixLoc = gl.getUniformLocation(program, "uModelViewMatrix");
        projectionMatrixLoc = gl.getUniformLocation(program, "uProjectionMatrix");

        gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        eye = vec3(radius*Math.sin(phi), radius*Math.sin(theta),
             radius*Math.cos(phi));

        modelViewMatrix = lookAt(eye, at , up);
        projectionMatrix = ortho(left, right, bottom, top, near, far);


        gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
        gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));

        gl.drawArrays(gl.TRIANGLES, 0, numVertices);
        requestAnimationFrame(render);
    }
}
run();
