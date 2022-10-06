import mongoose from "mongoose";

mongoose.connect("mongodb://127.0.0.1:27017/wetube");
// 뭔가 안되면 위의 ()안에 ,{ useNewUrlParser: true, useUnifiedTopology:true, } 집어넣어보기.
// update할 때마다 useFindAndModify에러가 뜨면 useFindAndModify: false도 넣어보기.
// 강의에서는 하는데 난 경고창이 안뜨길래 안했음.

const db = mongoose.connection;
const handleError = (error) => console.log("❌ DB Error", error); //error 의 정보는 mongoose에서 받아옴.
db.on("error", handleError);
const handleOpen = () => console.log("✅ Connected to DB");
db.once("open", handleOpen);
