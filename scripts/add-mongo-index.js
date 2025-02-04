if (!db.getCollectionNames().includes("entities")) {
  db.createCollection("entities");
}
db.entities.createIndex({
  "_id.servicePath": 1,
  "_id.id": 1,
  "_id.type": 1
}, {unique: true});
db.entities.createIndex({"creDate": 1});
db.entities.createIndex({"_id.id": 1});
db.entities.createIndex({"_id.type": 1});
db.entities.createIndex({"_id.servicePath": 1});
db.entities.createIndex({"attrNames": 1});
db.entities.createIndex({"location.coords": "2dsphere"});
// oasismap original
db.entities.createIndex({"attrs.timestamp.value": 1});
db.entities.createIndex({"attrs.nickname.value": 1});
db.entities.createIndex({
  "attrs.timestamp.value": 1,
  "attrs.nickname.value": 1
});
