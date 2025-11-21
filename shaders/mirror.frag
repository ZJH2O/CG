#version 300 es
precision mediump float;

out vec4 FragColor;

in vec3 FragPos;
in vec3 Normal;
in float FogDistance;

uniform vec3 viewPos;
uniform samplerCube cubeSampler;

uniform vec3 lightPos;
uniform vec3 lightColor;
uniform float ambientStrength;
uniform float specularStrength;
uniform float shininess;

uniform float reflectivity;
uniform float metallic;

// 雾化参数
uniform int fogType;
uniform float fogDensity;
uniform float fogStart;
uniform float fogEnd;
uniform vec3 fogColor;

float calculateFogFactor() {
    if (fogType == 0) return 1.0;
    
    float distance = FogDistance;
    
    if (fogType == 1) {
        float factor = (fogEnd - distance) / (fogEnd - fogStart);
        return clamp(factor, 0.0, 1.0);
    }
    else if (fogType == 2) {
        float factor = exp(-fogDensity * distance);
        return clamp(factor, 0.0, 1.0);
    }
    else if (fogType == 3) {
        float factor = exp(-pow(fogDensity * distance, 2.0));
        return clamp(factor, 0.0, 1.0);
    }
    
    return 1.0;
}

void main() {
    vec3 norm = normalize(Normal);
    vec3 lightDir = normalize(lightPos - FragPos);
    vec3 viewDir = normalize(viewPos - FragPos);
    
    float diff = max(dot(norm, lightDir), 0.0);
    vec3 ambient = ambientStrength * lightColor;
    vec3 diffuse = diff * lightColor;
    vec3 reflectDir = reflect(-lightDir, norm);
    float spec = pow(max(dot(viewDir, reflectDir), 0.0), shininess);
    vec3 specular = specularStrength * spec * lightColor;
    
    vec3 lighting = ambient + diffuse + specular;
    vec3 R = reflect(-viewDir, norm);
    vec3 envColor = texture(cubeSampler, R).rgb;
    
    vec3 baseColor = vec3(0.8, 0.8, 0.9);
    float fresnel = dot(norm, viewDir);
    fresnel = pow(1.0 - fresnel, 2.0);
    float reflectionIntensity = reflectivity * (fresnel + diff * 0.5);
    vec3 materialColor = mix(baseColor, envColor, metallic);
    vec3 finalLighting = materialColor * lighting;
    vec3 resultColor = mix(finalLighting, envColor, reflectionIntensity * metallic);
    
    // 应用雾化效果
    float fogFactor = calculateFogFactor();
    vec3 finalColor = mix(fogColor, resultColor, fogFactor);
    
    FragColor = vec4(finalColor, 1.0);
}