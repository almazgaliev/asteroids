// Generated using webpack-cli https://github.com/webpack/webpack-cli

const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

// const isProduction = process.env.NODE_ENV == 'production';
const devMode = process.env.NODE_ENV == 'development';


const stylesHandler = 'style-loader';



const config = {
  entry: {
    index: ['./src/main.js', './src/math.js', './src/draw.js'],
    style: './src/main.css'
  },
  output: {
    filename: "[name].bundle.js",
    path: path.resolve(__dirname, 'dist/wp' + (devMode ? "/dev" : "/prod")),
    clean: true,
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'src/index.html',
    }),
    new MiniCssExtractPlugin()
    // Add your plugins here
    // Learn more about plugins from https://webpack.js.org/configuration/plugins/
  ],
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/i,
        loader: 'babel-loader',
      },
      {
        test: /\.css$/i,
        use: [stylesHandler, 'css-loader'],
        use: [
          devMode ? "style-loader" : MiniCssExtractPlugin.loader,
          "css-loader",
        ],
      },

      {
        test: /\.(eot|svg|ttf|woff|woff2|png|jpg|gif)$/i,
        type: 'asset',
      },

      // Add your rules for custom modules here
      // Learn more about loaders from https://webpack.js.org/loaders/
    ],
  },
};

module.exports = () => {
  if (devMode) {
    config.mode = 'development';
  } else {
    config.mode = 'production';
  }
  return config;
};
