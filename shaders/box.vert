#version 300 es
in vec4 vPosition;
in vec4 vNormal;
in vec2 vTexCoord;

out vec3 Normal;
out vec3 FragPos;
out vec2 TexCoord;
out vec4 FragPosLightSpace;
out float FogDistance;

uniform mat4 u_ModelMatrix;
uniform mat4 u_ViewMatrix;
uniform mat4 u_ProjectionMatrix;
uniform mat4 u_LightSpaceMatrix;

void main()
{
    vec4 worldPos = u_ModelMatrix * vPosition;
    vec4 viewPos = u_ViewMatrix * worldPos;
    
    gl_Position = u_ProjectionMatrix * viewPos;
    
    FragPos = vec3(worldPos);
    Normal = normalize(mat3(transpose(inverse(u_ModelMatrix))) * vec3(vNormal));
    TexCoord = vTexCoord;
    FragPosLightSpace = u_LightSpaceMatrix * worldPos;
    
    // 计算片段到相机的距离（用于雾化）
    FogDistance = length(viewPos.xyz);
}