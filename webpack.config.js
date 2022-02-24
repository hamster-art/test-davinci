const path = require('path');
const outputDir = path.resolve(__dirname, 'build');
module.exports = {
    // entry: path.resolve(__dirname, '/app/src'),
    context: __dirname + '/src/js',
    output: {
        path: outputDir + '/js',
        filename: 'scripts.js'
    },
    optimization: {
        minimize: false,
    },
    module: {
        rules: [{
            test: /\.js$/,
            exclude: /node_modules/,
            use: {
                loader: require.resolve("babel-loader"),
                options: {
                    presets: [
                        ["@babel/preset-env", { modules: false }]
                    ]
                }
            }
        }]
    }
};
