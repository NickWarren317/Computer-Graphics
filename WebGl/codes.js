//Bunch of snippets from class...

var canvas=document.getElementById("gl-canvas");


//some notes



//This function converts from canvas coordinates to viewport coordinates on click
canvas.addEventListener("click", function(event){
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer);
    var t = vec2(2*event.clientX/canvas.width-1, 2*(canvas.height-event.clientY)/canvas.height-1);
    gl.bufferSubData(gl.ARRAY_BUFFER, 8*index, flatten(t));
    index++;
});

canvas.addEventListener("click", function(event){
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer);
    //things
});