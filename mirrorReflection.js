// mirrorReflection.js
// 全局变量暴露（主文件可访问）
window.mirrorProgram = null;
window.isMirrorMode = false;
window.mirrorVAO = null;

// 初始化镜面反射程序
window.initMirrorProgram = function() {
    if (!window.gl) {
        console.error("WebGL上下文未初始化");
        return false;
    }
    
    try {
        mirrorProgram = initShaders(gl, "shaders/mirror.vert", "shaders/mirror.frag");
        if (!mirrorProgram) {
            throw new Error("镜面着色器编译失败");
        }
        
        // 创建VAO（Vertex Array Object）
        mirrorVAO = gl.createVertexArray();
        gl.bindVertexArray(mirrorVAO);
        
        // 初始化顶点缓冲区（只做一次）
        initArrayBuffer(gl, mirrorProgram, flatten(points), 4, gl.FLOAT, "vPosition");
        
        // 修复法向量数据：将vec4转换为vec3
        var normalsArrayVec3 = [];
        for (var i = 0; i < normalsArray.length; i++) {
            normalsArrayVec3.push(normalsArray[i][0], normalsArray[i][1], normalsArray[i][2]);
        }
        initArrayBuffer(gl, mirrorProgram, new Float32Array(normalsArrayVec3), 3, gl.FLOAT, "vNormal");
        
        gl.bindVertexArray(null);
        
        console.log("镜面程序初始化成功");
        return true;
    } catch (error) {
        console.error("镜面程序初始化失败:", error);
        return false;
    }
};

// 绘制镜面立方体（带光照效果）
window.drawMirrorCube = function() {
    if (!mirrorProgram || !window.cubeMap || !mirrorVAO) return;
    
    const gl = window.gl;
    
    // 保存当前状态
    const previousProgram = gl.getParameter(gl.CURRENT_PROGRAM);
    
    // 切换到镜面程序
    gl.useProgram(mirrorProgram);
    
    // 使用VAO（避免重复设置顶点属性）
    gl.bindVertexArray(mirrorVAO);
    
    // 设置变换矩阵
    const ModelMatrix = formModelMatrix();
    const ViewMatrix = formViewMatrix();
    const ProjectionMatrix = formProjectMatrix();
    
    gl.uniformMatrix4fv(gl.getUniformLocation(mirrorProgram, "u_ModelMatrix"), false, flatten(ModelMatrix));
    gl.uniformMatrix4fv(gl.getUniformLocation(mirrorProgram, "u_ViewMatrix"), false, flatten(ViewMatrix));
    gl.uniformMatrix4fv(gl.getUniformLocation(mirrorProgram, "u_ProjectionMatrix"), false, flatten(ProjectionMatrix));
    gl.uniform3fv(gl.getUniformLocation(mirrorProgram, "viewPos"), flatten(eyePos));
    
    // 设置光照参数
    gl.uniform3fv(gl.getUniformLocation(mirrorProgram, "lightPos"), 
                 flatten(vec3(lightPosition[0], lightPosition[1], lightPosition[2])));
    gl.uniform3fv(gl.getUniformLocation(mirrorProgram, "lightColor"), 
                 flatten(vec3(1.0, 1.0, 1.0))); // 白光
    
    // 设置光照强度参数
    gl.uniform1f(gl.getUniformLocation(mirrorProgram, "ambientStrength"), 0.3);
    gl.uniform1f(gl.getUniformLocation(mirrorProgram, "specularStrength"), 0.8);
    gl.uniform1f(gl.getUniformLocation(mirrorProgram, "shininess"), 32.0);
    
    // 设置镜面参数
    gl.uniform1f(gl.getUniformLocation(mirrorProgram, "reflectivity"), 0.7);
    gl.uniform1f(gl.getUniformLocation(mirrorProgram, "metallic"), 0.9);
    
    // 设置立方体贴图
    gl.activeTexture(gl.TEXTURE4);
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, window.cubeMap);
    gl.uniform1i(gl.getUniformLocation(mirrorProgram, "cubeSampler"), 4);
    
    if (typeof fogType !== 'undefined') {
        gl.uniform1i(gl.getUniformLocation(mirrorProgram, "fogType"), fogType);
        gl.uniform1f(gl.getUniformLocation(mirrorProgram, "fogDensity"), fogDensity);
        gl.uniform1f(gl.getUniformLocation(mirrorProgram, "fogStart"), fogStart);
        gl.uniform1f(gl.getUniformLocation(mirrorProgram, "fogEnd"), fogEnd);
        gl.uniform3fv(gl.getUniformLocation(mirrorProgram, "fogColor"), fogColor);
    }
    // 绘制立方体
    gl.drawArrays(gl.TRIANGLES, 0, cubenumPoints);
    
    // 恢复状态
    gl.bindVertexArray(null);
    gl.useProgram(previousProgram);
};

// 切换模式函数
window.toggleMirrorMode = function() {
    window.isMirrorMode = !window.isMirrorMode;
    console.log("镜面模式:", window.isMirrorMode ? "开启" : "关闭");
    return window.isMirrorMode;
};