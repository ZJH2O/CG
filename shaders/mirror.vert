#version 300 es
in vec4 vPosition;
in vec3 vNormal;

out vec3 FragPos;
out vec3 Normal;
out float FogDistance;

uniform mat4 u_ModelMatrix;
uniform mat4 u_ViewMatrix;
uniform mat4 u_ProjectionMatrix;

void main() {
    vec4 worldPos = u_ModelMatrix * vPosition;
    vec4 viewPos = u_ViewMatrix * worldPos;
    
    gl_Position = u_ProjectionMatrix * viewPos;
    
    FragPos = vec3(worldPos);
    Normal = normalize(mat3(transpose(inverse(u_ModelMatrix))) * vNormal);
    FogDistance = length(viewPos.xyz); // 雾化距离
}