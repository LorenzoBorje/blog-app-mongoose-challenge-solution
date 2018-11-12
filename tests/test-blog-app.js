'use strict';

// imports
  // libraries
  // environment

const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');

const expect = chai.expect;

const {BlogPost} = require('../models');
const {app, runServer, closeServer} = require('../server');
const {TEST_DATABASE_URL} = require('../config');

chai.use(chaiHttp);

// function set up

// seed database
function seedBlogData() {
  console.info('Seeding test database');
  const seedData = [];
  for (let i = 0; i < 10; i++){
    seedData.push(generateBlogData());
  }
  return BlogPost.insertMany(seedData);
}

// generate blog data
function generateBlogData() {
  return {
    title: faker.lorem.slug(6),
    content: faker.lorem.sentence(),
    author: faker.name.findName(),
  }
}

// teardown database
function teardownDb() {
  console.warn('Deleting database');
  return mongoose.connection.dropDatabase();
}

describe('Blog posts API resource', function() {

  before(function() {
    return runServer(TEST_DATABASE_URL);
  });

  beforeEach(function() {
    return seedBlogData();
  });

  afterEach(function() {
    return teardownDb();
  });

  after(function() {
    return closeServer();
  });

  
});

// tests

  // CRUD for blog posts
  // CUD for authors