import restart from "vite-plugin-restart"
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
        restart({ restart: [ '../static/**', ] }) // Restart server on static file change
    ]
}