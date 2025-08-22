#define PI 3.141592653589793238462643383279

uniform float uTime;
uniform float uFrequency;

void main() 
{
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    modelPosition.y += sin(modelPosition.x * uFrequency + uTime ) * 0.5;
    modelPosition.z += cos(modelPosition.x * uFrequency + uTime - PI * 0.25 ) * 0.5;
    gl_Position = projectionMatrix * viewMatrix * modelPosition;
    gl_PointSize = 4.0; 
}