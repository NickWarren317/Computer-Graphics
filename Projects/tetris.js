/*
    Nicholas Warren
    12164563

    CS 435 - Computer Graphics

    A javascript program to move around tetriminoes.
*/

"use strict";

//main variables, this is where the cookin happens.
var gl;
var points=[];
var sqaure_size = 0.025;

//holds the individual squares...
var num_shapes = 0;
var num_positions = [];
var start_idx = [0];

var square_centers = [];

// holds each tetrimino location and infomation...
var num_minos = 0;
var pieces_index = [0];
var minos = [];

//rotation varaible of a tetrimino, may or may not be used...
var pieces_orientation = [];



var colors = [
    vec4(0.0, 0.0, 0.0, 1.0),  // black
    vec4(1.0, 0.0, 0.0, 1.0),  // red
    vec4(1.0, 1.0, 0.0, 1.0),  // yellow
    vec4(0.0, 1.0, 0.0, 1.0),  // green
    vec4(0.0, 0.0, 1.0, 1.0),  // blue
    vec4(1.0, 0.0, 1.0, 1.0),  // magenta
    vec4(0.0, 1.0, 1.0, 1.0)   // cyan
];

//templates for drawing each shape and each orientation.
var t_block = [

    //pos1
    [   make_square_at_point,
        add_up,
        add_left,
        add_right
    ],

    //pos2
    [
        make_square_at_point,
        add_up,
        add_right,
        add_down
    ],

    //pos3
    [
        make_square_at_point,
        add_down,
        add_left,
        add_right
    ],

    //pos4
    [
        make_square_at_point,
        add_up,
        add_left,
        add_down
    ]
];

//remains the same no matter the orientation
var square_block = [
    [   
        make_square_at_point,
        add_up,
        add_left,
        add_top_left
    ]
];


var long_block = [
    [
        make_square_at_point,
        add_up,
        add_down,
        add_outer_top
    ],
    [
        make_square_at_point,
        add_left,
        add_right,
        add_outer_right
    ]
];

var right_step_block = [
    [
        make_square_at_point,
        add_up,
        add_left,
        add_top_right
    ],
    [
        make_square_at_point,
        add_up,
        add_right,
        add_bottom_right
    ]
];

var left_step_block = [
    [
        make_square_at_point,
        add_up,
        add_right,
        add_top_left
    ],
    [
        make_square_at_point,
        add_up,
        add_left,
        add_bottom_left
    ]

];  

var clockwise_l_block = [
    [
        make_square_at_point,
        add_down,
        add_up,
        add_bottom_left
    ],
    [
        make_square_at_point,
        add_right,
        add_left,
        add_top_left
    ],
    [
        make_square_at_point,
        add_down,
        add_up,
        add_top_right
    ],
    [
        make_square_at_point,
        add_right,
        add_left,
        add_top_right
    ],
];

var counter_clockwise_l_block = [
    [
        make_square_at_point,
        add_down,
        add_up,
        add_bottom_right
    ],
    [
        make_square_at_point,
        add_left,
        add_right,
        add_bottom_left
    ],
    [
        make_square_at_point,
        add_down,
        add_up,
        add_top_left
    ],
    [
        make_square_at_point,
        add_left,
        add_right,
        add_top_right
    ]
];

var tetrimino_templates = [
    counter_clockwise_l_block,
    left_step_block,
    clockwise_l_block,
    right_step_block,
    long_block,
    square_block,
    t_block
];

var top_line = [
    vec2(0.7,-1),
    vec2(0.7, 1)
]

var bottom_line = [
    vec2(-0.7, -1),
    vec2(0.7, -1)
]

window.onload = function init()
{
    var canvas = document.getElementById( "gl-canvas" );
    gl = canvas.getContext('webgl2');
    if (!gl) { alert( "WebGL 2.0 isn't available" ); }

    //
    //  Initialize our data for a single triangle
    //

    // First, initialize the  three points.
    //begin gathering the point
    //  Configure WebGL
    //
    gl.viewport(0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    //  Load shaders and initialize attribute buffers
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    //
    var line = -0.65;
    for(var i = 0; i < tetrimino_templates.length; i++){
        draw_tetrimino(tetrimino_templates[i], line + (i * 0.2), 0.825, 0.025, 0);
    } 

    rotate_clockwise(0);
    // Load the data into the GPU
    var bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId );


    //draw top and bottom border lines

    var displacement = 0.7;
   // points.push(vec2(-1,displacement),vec2(1,displacement));
    //points.push(vec2(-1,-displacement),vec2(1,-displacement));


    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

    // Associate out shader variables with our data buffer

    var aPosition = gl.getAttribLocation( program, "aPosition" );
    gl.vertexAttribPointer( aPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( aPosition );

    console.log(points);
    render();
};


var offset = 2.03;

//rotates points between the two indicies of the points
//(−(y−b)+a,(x−a)+b)
function rotate_clockwise(mino_idx){
    //Iterate the template....
    //needs a way to keep track of what type of mino each is....
    //and what is the current orientation
    var center = square_centers[mino_idx];

    var template = tetrimino_templates[mino_idx];
    var orient = pieces_orientation[mino_idx];

    var x = pieces_index[mino_idx];

    points.splice(x, x + 16);
    
    draw_tetrimino(template, center[0], center[1], 0.025, (orient + 1) % template.length)

}

function rotate_counter_clockwise(start, end){
    //Decrement the template
}

function add_up(x,y,size){
    make_square_at_point(x,y + size*offset, size);
}
function add_down(x,y,size){
    make_square_at_point(x,y - size*offset, size);
}
function add_right(x,y,size){
    make_square_at_point(x + size*offset,y, size);
}
function add_left(x,y,size){
    make_square_at_point(x - size*offset,y, size);
}
function add_bottom_left(x,y,size){
    make_square_at_point(x - size*offset, y - size*offset, size);
}
function add_bottom_right(x,y,size){
    make_square_at_point(x + size*offset, y - size*offset, size);
}
function add_top_left(x,y,size){
    make_square_at_point(x - size*offset, y + size*offset, size);
}
function add_top_right(x,y,size){
    make_square_at_point(x + size*offset, y + size*offset, size);
}
function add_outer_top(x,y,size){
    make_square_at_point(x, y + size*offset*2, size);
}
function add_outer_right(x,y,size){
    make_square_at_point(x + size*offset*2, y, size);
}
function add_outer_left(x,y,size){
    make_square_at_point(x - size*offset*2, y, size);
}
function add_outer_bottom(x,y,size){
    make_square_at_point(x, y - size*offset*2, size);
}


function draw_tetrimino(instructions, x, y, size, orient = 0){
    pieces_index[num_minos] = num_minos * 16;

    minos[num_minos] = instructions;
    pieces_orientation[num_minos] = orient;

    for(var i = 0 ; i < instructions[orient].length ; i++){
        instructions[orient][i](x,y,size);
    }


    num_minos = num_minos + 1;
}


function make_square_at_point(x, y, size){
    
    //drawing square so, 4 points.

    num_positions[num_shapes] = 4;

    if(num_shapes === 0){
        start_idx[num_shapes] = 0;
    } else {
        start_idx[num_shapes] = start_idx[num_shapes - 1] + num_positions[num_shapes - 1];
    }

    square_centers[num_shapes] = vec2(x,y);

    num_shapes = num_shapes + 1;


    points.push(vec2(x + size, y + size));
    points.push(vec2(x - size, y + size));
    points.push(vec2(x - size, y - size));
    points.push(vec2(x + size, y - size));
    
}


function get_distance(x1,y1,x2,y2){
    return Math.sqrt((x1 - x2)**2 +(y1 - y2)**2);   
}


function render() {
    gl.clear( gl.COLOR_BUFFER_BIT );

    for(var i=0; i<num_shapes; i++) {
        gl.drawArrays( gl.TRIANGLE_FAN, start_idx[i], num_positions[i] );
    }

    //draw lines
    var boundry_offset = start_idx[num_shapes-1] + num_positions[num_shapes-1];
    //gl.drawArrays(gl.LINE_STRIP, boundry_offset, 2);
    //gl.drawArrays(gl.LINE_STRIP, boundry_offset + 2, 2);

}