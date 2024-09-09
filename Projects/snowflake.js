/*
    Nicholas Warren
    12164563

    CS 435 - Computer Graphics

    A javascript program to render a Koch Snowflake using recursive triangle rendering.

*/

"use strict";

var gl;

var iters = 5;
console.log(iters);

var points;
var points1;


window.onload = function init()
{
    var canvas = document.getElementById( "gl-canvas" );
    gl = canvas.getContext('webgl2');
    if (!gl) { alert( "WebGL 2.0 isn't available" ); }

    //
    //  Initialize our data for a single triangle
    //

    // First, initialize the  three points.
    points = [
        0.0,  0.5,  // a
        -0.5, -0.5,  // b
         0.5, -0.5, // c
    ];
    //begin gathering the points
    draw_koch_snowflake(points[0], points[1], points[2], points[3], points[4], points[5], iters);
    //
    //  Configure WebGL
    //
    gl.viewport(0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    //  Load shaders and initialize attribute buffers
    //points.push(mix(-1,))
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    // Load the data into the GPU
    var bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId );
    gl.bufferData(gl.ARRAY_BUFFER, Float32Array.from(points), gl.STATIC_DRAW);

    // Associate out shader variables with our data buffer

    var aPosition = gl.getAttribLocation( program, "aPosition" );
    gl.vertexAttribPointer( aPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( aPosition );
    render();
    

};

function get_midpoint(a,b,c,d){
    var p1 = ( a + c ) / 2;
    var p2 = ( b + d ) / 2;
    return [p1,p2]
}

function get_thirdpoint(x1,y1,x2,y2){
    var p1 = (x1 + 1/3*(x2-x1));
    var p2 = (y1 + 1/3*(y2-y1));
    return [p1,p2];
}

function get_distance(x1,y1,x2,y2){
    return Math.sqrt((x1 - x2)**2 +(y1 - y2)**2);   
}


function render() {
    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.drawArrays( gl.TRIANGLES, 0, points.length / 2);
}

function draw_koch_snowflake(
    x1,
    y1,
    x2,
    y2,
    x3,
    y3,
    count
){
    //break if done iterating
    if (count === 0) {
        return;
    }
    count = count - 1;

    //find midpoints between each midpoint and current points

    var aab_midpoint = get_thirdpoint(x1,y1,x2,y2);
    var bba_midpoint = get_thirdpoint(x2,y2,x1,y1);

    var aac_midpoint = get_thirdpoint(x1,y1,x3,y3);
    var cca_midpoint = get_thirdpoint(x3,y3,x1,y1);

    var ccb_midpoint = get_thirdpoint(x3,y3,x2,y2);
    var bbc_midpoint = get_thirdpoint(x2,y2,x3,y3);

    //find distance between points

    var ab_dist = get_distance(x1,y1,x2,y2);
    var ac_dist = get_distance(x1,y1,x3,y3);
    var bc_dist = get_distance(x2,y2,x3,y3);

    //find last point which is the point half the distance between the two points away at a perpindicular angle from the main midpoint
    var ab_apex = findThirdPoint(x1,y1,x2,y2, ab_dist/3); 
    var ac_apex = findThirdPoint(x1,y1,x3,y3, ac_dist/3);
    var bc_apex = findThirdPoint(x2,y2,x3,y3, bc_dist/3);

    //append each to list

    //AB side
    //T1
    points.push(aab_midpoint[0], aab_midpoint[1]);
    points.push(bba_midpoint[0], bba_midpoint[1]);
    points.push(ab_apex[0], ab_apex[1]);
    //T2
    points.push(aab_midpoint[0], aab_midpoint[1]);
    points.push(bba_midpoint[0], bba_midpoint[1]);
    points.push(ab_apex[2], ab_apex[3]);

    //AC side
    //T1
    points.push(aac_midpoint[0], aac_midpoint[1]);
    points.push(cca_midpoint[0], cca_midpoint[1]);
    points.push(ac_apex[0], ac_apex[1]);
    //T2
    points.push(aac_midpoint[0], aac_midpoint[1]);
    points.push(cca_midpoint[0], cca_midpoint[1]);
    points.push(ac_apex[2], ac_apex[3]);

    //BC side
    //T1
    points.push(bbc_midpoint[0], bbc_midpoint[1]);
    points.push(ccb_midpoint[0], ccb_midpoint[1]);
    points.push(bc_apex[0], bc_apex[1]);
    //T2
    points.push(bbc_midpoint[0], bbc_midpoint[1]);
    points.push(ccb_midpoint[0], ccb_midpoint[1]);
    points.push(bc_apex[2], bc_apex[3]);


    //T1
    draw_koch_snowflake(aab_midpoint[0], aab_midpoint[1], bba_midpoint[0], bba_midpoint[1], ab_apex[0], ab_apex[1], count);
    draw_koch_snowflake(aac_midpoint[0], aac_midpoint[1], cca_midpoint[0], cca_midpoint[1], ac_apex[0], ac_apex[1], count);
    draw_koch_snowflake(bbc_midpoint[0], bbc_midpoint[1], ccb_midpoint[0], ccb_midpoint[1], bc_apex[0], bc_apex[1], count);

    //T2
    draw_koch_snowflake(aab_midpoint[0], aab_midpoint[1], bba_midpoint[0], bba_midpoint[1], ab_apex[2], ab_apex[3], count);
    draw_koch_snowflake(aac_midpoint[0], aac_midpoint[1], cca_midpoint[0], cca_midpoint[1], ac_apex[2], ac_apex[3], count);
    draw_koch_snowflake(bbc_midpoint[0], bbc_midpoint[1], ccb_midpoint[0], ccb_midpoint[1], bc_apex[2], bc_apex[3], count);

    //recurse on the other 3 sides.
    draw_koch_snowflake(aab_midpoint[0], aab_midpoint[1], aac_midpoint[0], aac_midpoint[1], x1, y1, count);
    draw_koch_snowflake(bbc_midpoint[0], bbc_midpoint[1], bba_midpoint[0], bba_midpoint[1], x2, y2, count);
    draw_koch_snowflake(cca_midpoint[0], cca_midpoint[1], ccb_midpoint[0], ccb_midpoint[1], x3, y3, count);

}

//finds the thrid point to form the triangle...
//It really generates two points as it is unknown which direction the point should be placed. Both are rendered, but one is hidden behind the parent triangle.
function findThirdPoint(x1, y1, x2, y2, d) {
    //Calculate the midpoints
    const mx = (x1 + x2) / 2;
    const my = (y1 + y2) / 2;

    //Calculate the length of the side of the equilateral triangle (which should be the same as distance d)
    const sideLength = d;
    
    //Calculate the height of the equilateral triangle
    const height = (Math.sqrt(3) / 2) * sideLength;

    //Calculate the vectors
    const vx = x2 - x1;
    const vy = y2 - y1;
    
    //Calculate the lengths
    const length = Math.sqrt(vx ** 2 + vy ** 2);
    
    //Find perp vector
    const perpX = -vy / length;
    const perpY = vx / length;

    //Calculate the third points by moving height distance along the perpendicular direction
    //could be in either direction
    const x3_1 = mx + height * perpX;
    const y3_1 = my + height * perpY;

    const x3_2 = mx - height * perpX;
    const y3_2 = my - height * perpY;

    
    return [x3_2, y3_2, x3_1, y3_1];
}