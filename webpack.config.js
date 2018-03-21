const path = require('path');
const webpack = require('webpack');
module.exports = {
  entry: "./index",
  module: {
    rules: [
        {
          exclude: /node_modules/,
          loader: 'babel-loader',
          query: {
            presets: ["es2015", "stage-3", "react"],
            plugins: ['transform-runtime']
          }
        }
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx']
  }
};

