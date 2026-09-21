import http from 'http'
import fs from 'fs'
import coBody from 'co-body'
const getData  = () => {
  try{
    return JSON.parse(fs.readFileSync('./data.json','utf-8'))
  }
  catch(e){
    return {}
  }
}
const saveData = (data) => {
  fs.writeFileSync('./data.json',JSON.stringify(data))
}
const server = http.createServer(async (req,res)=>{
  res.setHeader('Access-Control-Allow-Origin','*')
  res.setHeader('Access-Control-Allow-Methods','GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers','Content-Type')
  
  if (req.method === 'OPTIONS') {
    res.writeHead(204)
    res.end()
    return
  }
  
  if(req.method == 'GET' && req.url == '/greeting'){
    const data = getData()
    res.end(JSON.stringify(data))
  }
  if(req.method == 'POST' && req.url == '/save'){
    const data = await coBody.json(req)
    saveData(data)
    res.end('Success!')
  }
})

server.listen(3000,()=>{
  console.log('Server is running at port 3000')
})