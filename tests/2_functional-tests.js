const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
  test('Create an issue with every field',function(done){
    chai
    .request(server)
    .post('/api/issues/test')
    .send({'issue_title':'Test', 'issue_text':'test_text','created_by':'admin','assigned_to': 'me', 'status_text': 'ok' })
    .end((err,res)=>{
    assert.equal(res.body.issue_title,'Test');
    assert.equal(res.body.issue_text,'test_text');
    assert.equal(res.body.created_by,'admin');
    assert.equal(res.body.assigned_to,'me');
    assert.isObject(res.body);
    assert.equal(res.body.open, true);
    assert.equal(new Date(res.body.created_on).getMinutes, new Date().getMinutes);
    firstInsertedID = res.body._id;
    done();
    })
  });
  test ('Create an issue with only required fields', (done)=>{
    chai
    .request(server)
    .post('/api/issues/test')
    .send({'issue_title':'Test', 'issue_text':'test_text','created_by':'admin'})
    .end((err,res)=>{
    assert.equal(res.body.issue_title,'Test');
    assert.equal(res.body.assigned_to,'');
    assert.isTrue(res.body.open);
    assert.equal(new Date(res.body.updated_on).getMinutes, new Date().getMinutes);
    done();
    })
  });
  test ('Create an issue with missing required fields', (done)=>{
    chai
    .request(server)
    .post('/api/issues/test')
    .send({'issue_title':'Test','created_by':'admin'})
    .end((err,res)=>{
    assert.deepEqual(res.body, {error: 'required field(s) missing' })
    done();
    })
  });
  test ('View issues on a project', (done)=>{
    chai
    .request(server)
    .get('/api/issues/test')
    .end((err,res)=>{
    assert.isArray(res.body);
    assert.equal(res.status,200);
    assert.property(res.body[0],'created_on');
    assert.property(res.body[res.body.length-1],'created_on');
    done();
    })
  });
  test ('View issues on a project with one filter', (done)=>{
    chai
    .request(server)
    .get('/api/issues/test?created_by=Joe')
    .end((err,res)=>{
    assert.isArray(res.body);
    assert.equal(res.status,200);
    function filter(arr) {
  return arr.filter(x=>{x.created_by=="Joe"});
  };
    assert.deepEqual(res.body, filter(res.body));
    done();
    })
  });
 test('View issues on a project with multiple filters', (done)=>{
    chai
    .request(server)
    .get('/api/issues/test?created_by=Joe&assigned_to=Joe')
    .end((err,res)=>{
    assert.isArray(res.body);
    assert.equal(res.status,200);
    function filter(arr) {
  return arr.filter(x=>{x.created_by=="Joe"&&x.assigned_to=='Joe'})};
    assert.deepEqual(res.body, filter(res.body));
    done();
    })
  });
  test('Update one field on an issue', (done)=>{
    chai
    .request(server)
    .put('/api/issues/test')
    .send({_id:firstInsertedID,open:'false'})
    .end((err,res)=>{
    assert.equal(res.status,200);
    assert.deepEqual(res.body,{result:'successfully updated',_id:firstInsertedID});
    done(); 
  });
 });
 test('Update multiple fields on an issue', (done)=>{
    chai
    .request(server)
    .put('/api/issues/test')
    .send({_id:firstInsertedID,issue_text:'Hello', open:false})
    .end((err,res)=>{
    assert.equal(res.status,200);
    assert.deepEqual(res.body,{result:'successfully updated',_id:firstInsertedID});
    done(); 
  });
 });
 test('Update an issue with missing _id', (done)=>{
    chai
    .request(server)
    .put('/api/issues/test')
    .send({issue_text:'Hello'})
    .end((err,res)=>{
    assert.equal(res.status,200);
    assert.deepEqual(res.body,{ error: 'missing _id' });
    done(); 
  });
 });
 test('Update an issue with no fields to update', (done)=>{
    chai
    .request(server)
    .put('/api/issues/test')
    .send({_id:firstInsertedID})
    .end((err,res)=>{
    assert.equal(res.status,200);
    assert.deepEqual(res.body,{ error: 'no update field(s) sent', '_id':firstInsertedID });
    done(); 
  });
 });
 test('Update an issue with an invalid _id', (done)=>{
    chai
    .request(server)
    .put('/api/issues/test')
    .send({_id:'61',issue_text:'Hello'})
    .end((err,res)=>{
    assert.equal(res.status,200);
    assert.deepEqual(res.body,{ error:'could not update', '_id': '61' });
    done(); 
  });
 });
 test('Delete an issue', (done)=>{
    chai
    .request(server)
    .delete('/api/issues/test')
    .send({_id:firstInsertedID})
    .end((err,res)=>{
    assert.equal(res.status,200);
    assert.deepEqual(res.body,{ result: 'successfully deleted', '_id':firstInsertedID});
    done(); 
  });
 });
 test('Delete an issue with an invalid _id', (done)=>{
    chai
    .request(server)
    .delete('/api/issues/test')
    .send({_id:'615'})
    .end((err,res)=>{
    assert.equal(res.status,200);
    assert.deepEqual(res.body,{ error: 'could not delete', '_id': '615' });
    done(); 
  });
 });
 test('Delete an issue with missing _id', (done)=>{
    chai
    .request(server)
    .delete('/api/issues/test')
    .send({_id:''})
    .end((err,res)=>{
    assert.equal(res.status,200);
    assert.deepEqual(res.body,{ error: 'missing _id' });
    done(); 
  });
 });
});
