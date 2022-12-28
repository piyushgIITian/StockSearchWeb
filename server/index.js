const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

app.get("/:ticker", async (req,res)=>{
    
    try{
        
        const {data} = await axios.get(`https://query1.finance.yahoo.com/v7/finance/download/${req.params.ticker}?&period1=1514435251&period2=1641579977`);
        
        res.status(200).json(data);
    }catch(err){

        res.status(400).send(err);
    }
})
app.get("/price/:ticker", async (req,res)=>{
    try{
        
        const {data} = await axios.get(`https://query1.finance.yahoo.com/v11/finance/quoteSummary/${req.params.ticker}?&modules=financialdata`);
        res.status(200).json(data);
    }catch(err){
        res.status(400).send(err);
    }
})

const port = process.env.PORT || 5000;
app.listen(port,()=>{
    console.log(`Listening at http://localhost:${port}`);
});