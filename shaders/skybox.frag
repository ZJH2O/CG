#version 300 es
precision mediump float;

out vec4 FragColor;
in vec3 TexCoords;

uniform samplerCube cubeSampler;

// 雾化参数
uniform int fogType;
uniform float fogDensity;
uniform float fogStart;
uniform float fogEnd;
uniform vec3 fogColor;

void main()
{    
    vec4 texColor = texture(cubeSampler, TexCoords);
    
    // 对于天空盒，我们使用特殊的雾化处理
    // 计算基于纹理坐标的"距离"来模拟深度感
    float depthFactor = length(TexCoords) / 80.0; // 80是您天空盒的scale值
    
    float fogFactor = 1.0;
    
    if (fogType != 0) {
        if (fogType == 1) {
            // 线性雾
            fogFactor = (fogEnd - depthFactor * fogEnd) / (fogEnd - fogStart);
        } else if (fogType == 2) {
            // 指数雾
            fogFactor = exp(-fogDensity * depthFactor * fogEnd);
        } else if (fogType == 3) {
            // 指数平方雾
            fogFactor = exp(-pow(fogDensity * depthFactor * fogEnd, 2.0));
        }
        fogFactor = clamp(fogFactor, 0.0, 1.0);
    }
    
    // 混合雾色和纹理色
    vec3 finalColor = mix(fogColor, texColor.rgb, fogFactor);
    
    FragColor = vec4(finalColor, texColor.a);
}