/*
    Nicholas Warren
    12164563

    CS 435 - Computer Graphics

    A javascript program to move around tetriminoes.
*/

"use strict";

//event variables
var is_mousedown = false;
var shift_key = false;
var t1, t2;


//main variables, this is where the cookin happens.
var gl;
let points=[];
var colors=[];
var square_size = 0.025;
var offset = 2.03;
var death_line = -0.7;

//holds the individual squares...
var num_shapes = 0;
var num_positions = [];
var start_idx = [0];

var square_centers = [];

// holds each tetrimino location and infomation...
var num_minos = 0;
var pieces_index = [0];
var minos = [];
var mino_colors = [];

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
    ],
    [
        make_square_at_point,
        add_up,
        add_down,
        add_outer_bottom
    ],
    [
        make_square_at_point,
        add_left,
        add_right,
        add_outer_left
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
    ],
    [
        make_square_at_point,
        add_up,
        add_left,
        add_top_right
    ],
    [
        make_square_at_point,
        add_up,
        add_left,
        add_bottom_left
    ]
];

var left_step_block = [
    [
        make_square_at_point,
        add_left,
        add_down,
        add_bottom_right
    ],
    [
        make_square_at_point,
        add_down,
        add_right,
        add_top_right
    ],
    [
        make_square_at_point,
        add_left,
        add_down,
        add_bottom_right
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
    ]
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
    //
    //  Initialize our data for a single triangle
    //

    // First, initialize the  three points.
    //begin gathering the point
    //  Configure WebGL
    //
    //
    // Load the data into the GPU
    
    console.log(points);

    render();

    canvas.addEventListener("mouseup", function(event){
        is_mousedown = false;
      });

    canvas.addEventListener("mousedown", function(event){
        is_mousedown = true;
        var x = event.pageX - canvas.offsetLeft;
        var y = event.pageY - canvas.offsetTop;
        t1 = vec2(2*x/canvas.width-1, 
                    2*(canvas.height-y)/canvas.height-1);
        
        console.log(t1);
        
        
        
        if(shift_key){
            var c_object = is_within_mino(t1[0], t1[1]);
            if(c_object != -1){
                rotate_counter_clockwise(c_object, t1[0], t2[1]);
            }
        }
      });

    canvas.addEventListener("mousemove", function(event){
        if (is_mousedown) {
          var x = event.pageX - canvas.offsetLeft;
          var y = event.pageY - canvas.offsetTop;

          t2 = vec2(2*x/canvas.width-1, 2*(canvas.height-y)/canvas.height-1);
          
          var c_object = is_within_mino(t1[0], t1[1]);

          if(c_object != -1){
            move_mino_x(c_object, t2[0] - t1[0]);
            move_mino_y(c_object, t2[1] - t1[1]);
            redraw_minos();
          }

          t1 = t2;
        }
    } );

    document.addEventListener("keydown", function(event){
        if(event.key === 'Shift'){
            shift_key = true;
        }
    });
    document.addEventListener("keyup", function(event){
        if(event.key === 'Shift'){
            shift_key = false;
        }
    });


};

function move_mino_x(mino_idx, dist){
    if(minos[mino_idx] === -1) return;  
    square_centers[mino_idx][0] = square_centers[mino_idx][0] + dist;
    redraw_minos();
}

function move_mino_y(mino_idx, dist){
    if(minos[mino_idx] === -1) return; 
    square_centers[mino_idx][1] = square_centers[mino_idx][1] + dist;
    
    redraw_minos();
}

function is_within_mino(x, y){
    //iterate each mino, checking to see if the point is within the boundaries of a square.
    for(var i = 0; i < minos.length; i++){
        var p_idx = pieces_index[i];
        for (var j = p_idx; j < p_idx + 16; j = j + 4){
            //get the 4 points
            var p1 = points[j];   //t_right
            var p2 = points[j+1]; //t_left
            var p3 = points[j+2]; //b_left
            var p4 = points[j+3]; //b_right


            //check if y is less than top y and greater than bottom y
            if(y < p1[1] && y > p3[1]){

                //check if x is less than right x and greater than left x
                if(x < p4[0] && x > p2[0]){
                    //once found, return the index of the mino
                    return i;
                }
            }
        }
    }
    //-1 if not in a mino
    return -1;
    
}


//rotates points between the two indicies of the points
//(−(y−b)+a,(x−a)+b)
function rotate_clockwise(mino_idx){
    //Iterate the template....
    //needs a way to keep track of what type of mino each is....
    //and what is the current orientation
    var orient = pieces_orientation[mino_idx];
    
    draw_tetrimino(minos[mino_idx], square_centers[mino_idx][0], square_centers[mino_idx][1], 0.025, (orient + 1) % minos[mino_idx].length);

    minos[mino_idx] = -1;
    pieces_orientation[mino_idx] = orient + 1

    redraw_minos();

}

function rotate_counter_clockwise(mino_idx, x , y){
    //Iterate the template....
    //needs a way to keep track of what type of mino each is....
    //and what is the current orientation
    var orient = pieces_orientation[mino_idx];
    
    console.log(points);
    console.log(points.length);
    console.log(minos);
    
    
    draw_tetrimino(minos[mino_idx], square_centers[mino_idx][0], square_centers[mino_idx][1], 0.025, (orient + 3) % minos[mino_idx].length);

    //move tetrimino to give the illusion that it is rotating about the center of the clicked mino


    minos[mino_idx] = -1;
    pieces_orientation[mino_idx] = orient + 1

    redraw_minos();
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


function redraw_minos(){

    //clear shape buffers...
    var temp_points = points;
    var temp_centers = square_centers;
    var temp_minos = minos;

    //clear things
    minos=[];
    start_idx = [];
    num_minos = 0;
    points = [];
    num_shapes = 0;
    square_centers = []

    //redraw valid minos
    for(var i = 0; i < temp_minos.length; i++){
        //minos marked as -1 will be ignored, as they are deleted or rotated...
        if(temp_minos[i] === -1 || is_mino_under_line(i, temp_points)){
        //minos are redrawn when still there
        } else {
            draw_tetrimino(temp_minos[i], temp_centers[i][0], temp_centers[i][1], square_size, pieces_orientation[i]);
        }
    }

    render();
}

function is_mino_under_line(mino_idx, p){
    var start = pieces_index[mino_idx];
    for (var i = start; i < start + 16; i++){
        var y = p[i][1];
        if(y <= death_line) {
            minos[mino_idx] = -1;
            return true;
        }
    }
    return false;
}

function draw_tetrimino(instructions, x, y, size,orient = 0){
    pieces_index[num_minos] = num_minos * 16;
    minos[num_minos] = instructions;
    pieces_orientation[num_minos] = orient;
    square_centers[num_minos] = vec2(x,y);
    //mino_colors[num_minos] = color;

    for(var i = 0 ; i < instructions[orient].length ; i++){
        instructions[orient][i](x,y,size);
    }

    num_minos = num_minos + 1;                                  
}                 

function color_mino(color, mino_idx){

    
}

function make_square_at_point(x, y, size){
    
    //drawing square so, 4 points.

    num_positions[num_shapes] = 4;

    if(num_shapes === 0){
        start_idx[num_shapes] = 0;
    } else {
        start_idx[num_shapes] = start_idx[num_shapes - 1] + num_positions[num_shapes - 1];
    }

    num_shapes = num_shapes + 1;


    points.push(vec2(x + size, y + size));
    points.push(vec2(x - size, y + size));
    points.push(vec2(x - size, y - size));
    points.push(vec2(x + size, y - size));
    
}

function render() {
    var canvas = document.getElementById("gl-canvas");

    gl = canvas.getContext('webgl2');
    if (!gl) { alert( "WebGL 2.0 isn't available" ); }

    gl.viewport(0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    //  Load shaders and initialize attribute buffers
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );


    //draw top minos
    var line = -0.65;
    for(var i = 0; i < tetrimino_templates.length; i++){
        draw_tetrimino(tetrimino_templates[i], line + (i * 0.2), 0.825, 0.025, 0);
    } 


    var bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId );
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

    // Associate out shader variables with our data buffer
    var aPosition = gl.getAttribLocation( program, "aPosition" );
    gl.vertexAttribPointer( aPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( aPosition );



    gl.clear( gl.COLOR_BUFFER_BIT );

    for(var i=0; i < num_shapes; i++) {
        gl.drawArrays(gl.TRIANGLE_FAN, start_idx[i], num_positions[i] );
    }
    //draw top and bottom border lines

}