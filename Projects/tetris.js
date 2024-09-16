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
var held_mino = -1;
var t1, t2;


//main variables, this is where the cookin happens.
var gl;
var points=[];
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
let num_minos = 0;
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
    ],
    [   
        make_square_at_point,
        add_up,
        add_left,
        add_top_left
    ],
    [   
        make_square_at_point,
        add_up,
        add_left,
        add_top_left
    ],
    [   
        make_square_at_point,
        add_up,
        add_left,
        add_top_left
    ],
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

window.onload = function init()
{
    var canvas = document.getElementById( "gl-canvas" );
    
    // draw top tetriminoes
    var line = -0.65;
    for(var i = 0; i < tetrimino_templates.length; i++){
        draw_tetrimino(tetrimino_templates[i], line + (i * 0.2), 0.825, square_size, 0);
    }
    console.log(points);
    
    // render them
    render();


//--------------------------Canvas Events--------------------------
    canvas.addEventListener("mouseup", function(event){
        is_mousedown = false;
        console.log("Up!");
        held_mino = -1;
      });

    canvas.addEventListener("mousedown", function(event){
        is_mousedown = true;
        var x = event.pageX - canvas.offsetLeft;
        var y = event.pageY - canvas.offsetTop;
        t1 = vec2(2*x/canvas.width-1, 
                    2*(canvas.height-y)/canvas.height-1);
        
        //id of clicked tetrimino
        var c_object = is_within_mino(t1[0], t1[1]);

        //sets last held object
        if(held_mino == -1 && c_object != -1) {
            let obj = c_object;
            if(c_object < 7){
                obj = num_minos;
            }
            held_mino = obj;
        }
        
        //Mousedown + Shift triggers clockwise rotation
        if(shift_key){
            //if top object is selected
            if(c_object != -1 && c_object >= 7){
                rotate_counter_clockwise(c_object, t1[0], t2[1]);
            }
        //Also duplicates top mino if top mino is clicked
        } else {
            if(c_object != -1 && c_object < 7){
                draw_tetrimino(minos[c_object], t1[0], t1[1], square_size, 0);
            }
        }
      });
    //Movement if mino is held
    canvas.addEventListener("mousemove", function(event){
        if (is_mousedown) {
          var x = event.pageX - canvas.offsetLeft;
          var y = event.pageY - canvas.offsetTop;

          t2 = vec2(2*x/canvas.width-1, 2*(canvas.height-y)/canvas.height-1);
          
          var c_object = is_within_mino(t1[0], t1[1]);
            
          console.log(["Held Mino" , held_mino]);   
          if(c_object != -1 && held_mino != -1){
            move_mino_x(held_mino, t2[0] - t1[0]);
            move_mino_y(held_mino, t2[1] - t1[1]);
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

//increments points
function move_mino_x(mino_idx, dist){
    if(minos[mino_idx] === -1  || mino_idx < 7) return;  
    let star = pieces_index[mino_idx];
    for(var i = star; i < star + 16; i++){
        points[i][0] = points[i][0] + dist;
    }
    //square_centers[mino_idx][0] = square_centers[mino_idx][0] + dist;
    render();
}

function move_mino_y(mino_idx, dist){
    if(minos[mino_idx] === -1 || mino_idx < 7) return; 
    var star = pieces_index[mino_idx];
    for(var i = star; i < star + 16; i++){
        points[i][1] = points[i][1] + dist;
    }
    //square_centers[mino_idx][1] = square_centers[mino_idx][1] + dist;
    render();
}
//checks if in bounds of a square, then returns the mino index if found, or -1 if not
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
            if(y <= p1[1] && y >= p3[1]){

                //check if x is less than right x and greater than left x
                if(x <= p4[0] && x >= p2[0]){
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
/*
function rotate_clockwise(mino_idx){
    //Iterate the template....
    //needs a way to keep track of what type of mino each is....
    //and what is the current orientation
    var orient = pieces_orientation[mino_idx];
    
    pieces_orientation[mino_idx] = (orient + 1) % minos[mino_idx].length;

    redraw_minos();

}*/

function rotate_counter_clockwise(mino_idx,x,y){
    //finds which square is clicked, then rotates points around its center...

    for(var i = 0; i < minos.length; i++){
        var p_idx = pieces_index[i];
        for (var j = p_idx; j < p_idx + 16; j = j + 4){
            //get the 4 points
            var p1 = points[j];   //t_right
            var p2 = points[j+1]; //t_left
            var p3 = points[j+2]; //b_left
            var p4 = points[j+3]; //b_right

            //check if y is less than top y and greater than bottom y
            if(y <= p1[1] && y >= p3[1]){
                //check if x is less than right x and greater than left x
                if(x <= p4[0] && x >= p2[0]){
                    //once found, return the index of the mino
                    return rotate_about_a_point(((p1[0] + p2[0])/2), ((p2[1] + p3[1])/2), mino_idx);
                }
            }
        }
    }
}
function rotate_about_a_point(x,y,mino_idx){

    var start = pieces_index[mino_idx];
    console.log(["Rotating ", mino_idx]);
    for(var i = start; i < start + 16; i++){
        //subtract the C.O.R.
        console.log(i);
        console.log(points[i][0],points[i][1]);


        var temp_y, temp_x;

        // x,y -> -y,x
        //move point to midpoint by subtracting center x/y

        temp_x = points[i][0] - x;
        temp_y = points[i][1] - y;
        
        //swap x and y, add back the original center
        points[i][0] =  -temp_y + x;
        points[i][1] =  temp_x + y;
        
        console.log(points[i][0],points[i][1]);
    }

    render();

}
//Drawing each square about a center square
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

/*
function redraw_minos(){

    //clear shape buffers...
    let temp_points = [...points];
    let temp_centers = [...square_centers];
    let temp_minos = [...minos];
    let temp_num = num_minos;

    //clear things
    minos.length = 0;
    points.length = 0;
    square_centers.length = 0;
    start_idx.length = 0;
    pieces_index.length = 0;

    num_minos = 0;
    num_shapes = 0;

    //redraw valid minos
    for(var i = 0; i < temp_num; i++){
        //minos marked as -1 will be ignored, as they are deleted or rotated...
        if(temp_minos[i] === -1 || is_mino_under_line(i, temp_points)){
        //minos are redrawn when still there
        } else {
            draw_tetrimino(temp_minos[i], temp_centers[i][0], temp_centers[i][1], square_size, pieces_orientation[i]);
        }
    }
 

    render();
}*/

//check if below delete line, then delete if is
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

//draws a tetrimino based on a set of instructions
function draw_tetrimino(instructions, x, y, size,orient = 0){
    pieces_index[num_minos] = num_minos * 16;
    minos[num_minos] = instructions;
    pieces_orientation[num_minos] = orient;
    square_centers[num_minos] = vec2(x,y);
    //mino_colors[num_minos] = color;

    console.log(num_minos);

    for(var i = 0 ; i < instructions[orient].length ; i++){
        instructions[orient][i](x,y,size);
    }

    num_minos = num_minos + 1;  
    
    render();
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


    points.push(vec2(x + size, y + size)); //top right
    points.push(vec2(x - size, y + size)); //top left
    points.push(vec2(x - size, y - size)); //bottom left
    points.push(vec2(x + size, y - size)); //bottom right
    
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

    points.push(vec2(-1,-0.7));
    points.push(vec2(-1, 0.7));
    points.push(vec2( 1,-0.7));
    points.push(vec2( 1, 0.7));
    var bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId );
    gl.bufferData(gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW);

    points.length = points.length - 4;

    // Associate out shader variables with our data buffer
    var aPosition = gl.getAttribLocation( program, "aPosition" );
    gl.vertexAttribPointer( aPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( aPosition );



    gl.clear( gl.COLOR_BUFFER_BIT );
    
    //draw top and bottom border lines
    
    //gl.drawArrays(gl.LINES, end, 2);
    //gl.drawArrays(gl.LINES, end + 2, 2);


    for(var i=0; i < num_shapes; i++) {
        gl.drawArrays(gl.TRIANGLE_FAN, start_idx[i], 4);
    }

}