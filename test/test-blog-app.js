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
    author: {
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName()
    }  
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

  describe('GET endpoint', function() {

    it('should retrieve all blog posts', function() {
      // strategy:
      //  1. get all blog posts returned by GET request to /posts
      //  2. prove res has right status, data type
      //  3. prove  the number of blog posts is correct
      let res;
      return chai.request(app)
        .get('/posts')
        .then(function(_res) {
          res = _res;
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('array');
          expect(res.body).to.have.lengthOf.at.least(1);
          return BlogPost.count();
        })
        .then(count => {
          expect(res.body).to.have.lengthOf(count);
        });
    });
    
    it('should return blog posts with the right fields', function() {
      return chai.request(app)
        .get('/posts')
        .then(function(res) {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('array');
          expect(res.body).to.have.lengthOf.at.least(1);

          res.body.forEach(function(blogPost) {
            expect(blogPost).to.be.a('object');
            expect(blogPost).to.have.keys('id', 'title', 'content', 'author', 'created');
          });
        });
````});

    it('should retrieve one blog post based on id', function() {
        // strategy:
        // retrieve one blog post from get request
        // pass id through to get request for specific blog post
        // prove that it's the right status, data type
        // prove that it has the right fields present 
      
      let resPost;
      return chai.request(app)
        .get('/posts')
        .then(function(_res) {
          resPost = _res.body[0];
          return BlogPost.findById({_id: resPost.id});
        })
        .then(function(blogPost) {
          expect(resPost.id).to.equal(blogPost.id);
          expect(resPost.title).to.equal(blogPost.title);
          expect(resPost.content).to.equal(blogPost.content);
          expect(resPost.author).to.contain(blogPost.author.firstName);
        });
    });

  });

  describe('POST endpoint', function() {
    
    it('should add a new post', function() {
      
      const newPost = generateBlogData(); 
      
      return chai.request(app)
        .post('/posts')
        .send(newPost)
        .then(function(res) {
          expect(res).to.have.status(201);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body).to.have.keys('id', 'author', 'title', 'content', 'created');
        })
    });

    it('should verify all required fields are present', function() {
      const newPost = {
        title: faker.lorem.slug(5),
        content: faker.lorem.sentence()
      }

      return chai.request(app)
        .post('/posts')
        .send(newPost)
        .then(function(res) {
          expect(res).to.have.status(400);
        });     
    });

  });

  describe('PUT endpoint', function() {
    it('should update a post', function() {
      
      const updatePost = generateBlogData();

      return BlogPost.findOne()
      .then(function(post) {
        updatePost.id = post.id;
        return chai.request(app)
        .put(`/posts/${updatePost.id}`)
        .send(updatePost)
        .then(function(res) {
          expect(res).to.have.status(204);
        });
      })

    });
  });

  describe('DELETE endpoint', function() {
    it('should delete a post', function() {
      let id;

      return BlogPost.findOne()
        .then(function(post) {
          id = post.id;
          return chai.request(app)
          .delete(`/posts/${id}`)
          .then(function(res) {
            expect(res).to.have.status(204);
          })
        })
    })
  })

});

// tests

  // CRUD for blog posts
  // CUD for authors