var assert = require("assert");

//import task items for test
var task = require('../engine/task.js');
var taskExamples = require('./example-tasks');


describe('tasks:', function() {

  before(function() {
    // runs before all tests in this block
  });

  after(function() {
    // runs after all tests in this block
  });

  beforeEach(function() {
    // runs before each test in this block
  });

  afterEach(function() {
    // runs after each test in this block
  });

  // test cases

  describe('task check unique', function(done){
    it('task.duplicate should return name of non-unique task', function(done) {
      nonUniqueTask = task.duplicate(taskExamples.nonUniqueTasks());
      assert.equal(nonUniqueTask, 'not-unique');
      done();
    });

    it('task.areUnique should return false', function(done) {
      result = task.areUnique(taskExamples.nonUniqueTasks());
      assert.equal(result, false);
      done();
    });

  });

  describe('task check data fetch', function(done){
    it('task.getDataValue("unique2.unique3.not-unique.name1") should return "foundme!"', function(done) {
      dataValue = task.getDataValue(taskExamples.nonUniqueTasks(),
                                    'unique2.unique3.not-unique.name1');
      assert.equal(dataValue, 'foundme!');
      done();
    });

    it('task.getDataValue("not-unique.name1") should return "foundme!"', function(done) {
      dataValue = task.getDataValue(taskExamples.nonUniqueTasks(),
                                    'not-unique.name1');
      assert.equal(dataValue, 'foundme!');
      done();
    });

    it('task.getDataValue("invalid.path.elements") should return undefined', function(done) {
      dataValue = task.getDataValue(taskExamples.nonUniqueTasks(),
                                    'invalid.path.elements');
      assert.equal(dataValue, undefined);
      done();
    });

    it('task.initTaskStatuses(tasks) should set all undefined statuses to pending', function(done){
      tasks = task.initTaskStatuses(taskExamples.nonUniqueTasks());
      allPending = task.checkStatuses(tasks, 'pending');
      assert.equal(allPending, true);
      done();
    });
  });


});
