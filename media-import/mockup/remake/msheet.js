const sharp=require('sharp');
(async()=>{const [out,...s]=process.argv.slice(2);const t=await Promise.all(s.map(x=>sharp(x+'/mockup.jpg').resize(800,450).jpeg().toBuffer()));
await sharp({create:{width:1610,height:Math.ceil(s.length/2)*460,channels:3,background:'#888'}}).composite(t.map((b,i)=>({input:b,left:(i%2)*810,top:Math.floor(i/2)*460}))).jpeg({quality:72}).toFile(out)})()
