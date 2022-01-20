'use strict';
require('dotenv').config();
const fieldId=require('mongodb').ObjectId;

const {MongoClient}=require('mongodb');
const url=process.env.MONGO_URI;
const mongoClient=new MongoClient(url,{
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const myDb=mongoClient.db('isssues_db');
async function run(){
  try{
    await mongoClient.connect();
    console.log("db connected");
 }catch(err){
    console.log(err);
 }
}
run();

module.exports = function (app) {

  app.route('/api/issues/:project')
  
    .get(async function (req, res){
    let project = req.params.project;
    let query=req.query;
      try{
        if ( query._id ) query._id  = new fieldId( query._id );
        if (query.open ===''||query.open === 'true')query.open = true;
    else if(query.open === 'false')     query.open = false;
        var showAll=await myDb.collection(project).find(
        query).toArray();
        res.send(showAll);
      }catch(e){console.log(e);}
    })

    .post(async function (req, res){
      let project = req.params.project;
      const assigned=req.body.assigned_to?req.body.assigned_to:'';
      const status=req.body.status_text?req.body.status_text:"";
      try{
        if (!req.body.issue_title||!req.body.issue_text||!req.body.created_by)
          return res.send({error: 'required field(s) missing'});
        
        await myDb.collection(project).insertOne({
        issue_title:req.body.issue_title, issue_text:req.body.issue_text, created_by:req.body.created_by,
        assigned_to:assigned,
        status_text:status,
        created_on: new Date(),
        updated_on: new Date(),
        open:true,
        });
        
        var insertedDoc=await myDb.collection(project).find(
        {issue_title:req.body.issue_title}).sort({$natural:-1}).limit(1).toArray();
       
        res.send(insertedDoc[0]);
      }catch (e){
        console.error(e);
      }
    })
    
    .put(async function (req, res){
      let project = req.params.project;
    
      if(!req.body._id) return res.send({ error: 'missing _id' });
      var inputs=req.body;
      console.log(req.body);
      let id=req.body._id;
      
      try {
      delete inputs._id;
      for(var n in inputs){
        if(!inputs[n]) delete inputs[n];
      };
      
      inputs.updated_on=new Date(); 
     
     if (Object.keys(inputs).length == 1) {
      return res.send({ error: 'no update field(s) sent', _id: id});
      };
    if(!inputs.open)inputs.open=true;//если уже был закрыт, но в этот же ид вносим новое - open должно с false снова стать true

    const updated= await myDb.collection(project).findOneAndUpdate({_id: new fieldId (id)},
    {$set:inputs//обновляет значения тех свойств найденного документа, которые есть в обьекте inputs  
        },{returnNewDocument:true});
      
    if(updated.value== null) return res.send({  error:'could not update', '_id': id });
       
    res.send({result:'successfully updated','_id':id});
      }catch(e){res.send({ error: 'could not update', '_id': id});}
    })
    
    .delete(async function (req, res){
      let project = req.params.project;
      const id=req.body._id;
      
      if(!id) return res.send({error: 'missing _id'});
      try{
       const deleted= await myDb.collection(project).findOneAndDelete({_id:new fieldId (id)});
        deleted.value?res.send({result:'successfully deleted',_id: id }):res.send({ error: 'could not delete', _id:id });
       
      }catch(e){
       res.send({ error: 'could not delete', _id:id })
      }
    });  
};
