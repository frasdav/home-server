#!/usr/bin/env node

const deploy = require('./deploy');
const destroy = require('./destroy');

module.exports = {
  deploy,
  destroy,
};
