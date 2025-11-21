/*******************生成立方体纹理对象*******************************/
function configureCubeMap(program) {
    gl.activeTexture(gl.TEXTURE0);

    cubeMap = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubeMap);
    
    // 设置纹理参数
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE);

    gl.uniform1i(gl.getUniformLocation(program, "cubeSampler"), 0);

    var faces = [
        ["./skybox/right.jpg", gl.TEXTURE_CUBE_MAP_POSITIVE_X],
        ["./skybox/left.jpg", gl.TEXTURE_CUBE_MAP_NEGATIVE_X],
        ["./skybox/top.jpg", gl.TEXTURE_CUBE_MAP_POSITIVE_Y],
        ["./skybox/bottom.jpg", gl.TEXTURE_CUBE_MAP_NEGATIVE_Y],
        ["./skybox/front.jpg", gl.TEXTURE_CUBE_MAP_POSITIVE_Z],
        ["./skybox/back.jpg", gl.TEXTURE_CUBE_MAP_NEGATIVE_Z]
    ];
    
    var loadedFaces = 0;
    
    for (var i = 0; i < 6; i++) {
        var face = faces[i][1];
        var image = new Image();
        image.crossOrigin = "anonymous"; // 允许跨域加载
        image.onload = function(face, image) {
            return function() {
                gl.bindTexture(gl.TEXTURE_CUBE_MAP, cubeMap);
                gl.texImage2D(face, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
                loadedFaces++;
                
                // 当所有面都加载完成时生成mipmap
                if (loadedFaces === 6) {
                    gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
                    window.cubeMap = cubeMap; // 保存到全局变量
                    console.log("立方体贴图加载完成");
                    render(); // 触发重绘
                }
            };
        }(face, image);
        
        image.onerror = function(src) {
            return function() {
                console.error("Failed to load texture: " + src);
            };
        }(faces[i][0]);
        
        image.src = faces[i][0];
    }
    
    return cubeMap;
}

/*TODO1:创建一般2D颜色纹理对象并加载图片*/
function configureTexture(image) {
    var texture = gl.createTexture();
    
    gl.bindTexture(gl.TEXTURE_2D,texture);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER,gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.generateMipmap(gl.TEXTURE_2D);

    
    return texture;
}