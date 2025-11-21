#version 300 es
precision mediump float;

out vec4 FragColor;

uniform float ambientStrength, specularStrength, diffuseStrength, shininess;

in vec3 Normal;
in vec3 FragPos;
in vec2 TexCoord;
in vec4 FragPosLightSpace;
in float FogDistance;

uniform vec3 viewPos;
uniform vec4 u_lightPosition;
uniform vec3 lightColor;

uniform sampler2D diffuseTexture;
uniform sampler2D depthTexture;
uniform samplerCube cubeSampler;

// 雾化参数
uniform int fogType;           // 0=无雾, 1=线性雾, 2=指数雾, 3=指数平方雾
uniform float fogDensity;      // 雾密度
uniform float fogStart;        // 雾开始距离
uniform float fogEnd;          // 雾结束距离
uniform vec3 fogColor;         // 雾颜色

// 雾化计算函数
float calculateFogFactor() {
    if (fogType == 0) return 1.0; // 无雾
    
    float distance = FogDistance;
    
    if (fogType == 1) {
        // 线性雾
        float factor = (fogEnd - distance) / (fogEnd - fogStart);
        return clamp(factor, 0.0, 1.0);
    }
    else if (fogType == 2) {
        // 指数雾
        float factor = exp(-fogDensity * distance);
        return clamp(factor, 0.0, 1.0);
    }
    else if (fogType == 3) {
        // 指数平方雾
        float factor = exp(-pow(fogDensity * distance, 2.0));
        return clamp(factor, 0.0, 1.0);
    }
    
    return 1.0;
}

float shadowCalculation(vec4 fragPosLightSpace, vec3 normal, vec3 lightDir) {
    float shadow = 0.0;
    
    vec3 projCoords = fragPosLightSpace.xyz / fragPosLightSpace.w;
    projCoords = projCoords * 0.5 + 0.5;

    if(projCoords.z > 1.0 || projCoords.x < 0.0 || projCoords.x > 1.0 || 
       projCoords.y < 0.0 || projCoords.y > 1.0) {
        return 0.0;
    }

    float currentDepth = projCoords.z;
    float bias = max(0.005 * (1.0 - dot(normal, lightDir)), 0.001);
    vec2 texelSize = 1.0 / vec2(textureSize(depthTexture, 0));
    
    for(int x = -1; x <= 1; ++x) {
        for(int y = -1; y <= 1; ++y) {
            float pcfDepth = texture(depthTexture, projCoords.xy + vec2(x, y) * texelSize).r;
            shadow += (currentDepth - bias) > pcfDepth ? 1.0 : 0.0;
        }
    }
    shadow /= 9.0;
    
    if(projCoords.z > 1.0) {
        shadow = 0.0;
    }

    return shadow;
}

void main() {
    // 采样纹理颜色
    vec3 TextureColor = texture(diffuseTexture, TexCoord).xyz;

    // 计算光照
    vec3 norm = normalize(Normal);
    vec3 lightDir;
    if(u_lightPosition.w == 1.0) 
        lightDir = normalize(u_lightPosition.xyz - FragPos);
    else 
        lightDir = normalize(u_lightPosition.xyz);
        
    vec3 viewDir = normalize(viewPos - FragPos);
    vec3 halfDir = normalize(viewDir + lightDir);

    vec3 ambient = ambientStrength * lightColor;
    float diff = max(dot(norm, lightDir), 0.0);
    vec3 diffuse = diffuseStrength * diff * lightColor;
    float spec = pow(max(dot(norm, halfDir), 0.0), shininess);
    vec3 specular = specularStrength * spec * lightColor;

    // 阴影计算
    float shadow = shadowCalculation(FragPosLightSpace, norm, lightDir);
    
    // 最终光照颜色
    vec3 resultColor = (ambient + (1.0 - shadow) * (diffuse + specular)) * TextureColor;
    
    // 雾化计算
    float fogFactor = calculateFogFactor();
    vec3 finalColor = mix(fogColor, resultColor, fogFactor);
    
    FragColor = vec4(finalColor, 1.0);
}