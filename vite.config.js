import restart from "vite-plugin-restart"
import glsl from "vite-plugin-glsl"
export default {
    root: "src/",
    publicDir: "../static/",
    build:
    {
        outDir: '../dist', // Output in the dist/ folder
        emptyOutDir: true, // Empty the folder first
        sourcemap: true // Add sourcemap
    },
    plugins: [
        restart({ restart: [ '../static/**', ] }), // Restart server on static file change
        glsl()
    ]
}