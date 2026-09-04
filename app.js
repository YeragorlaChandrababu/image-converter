const TARGET_W = 3024, TARGET_H = 4032;
let selectedFile = null, outputBlob = null, outputDataUrl = null;

const $ = id => document.getElementById(id);
const fileInput = $("fileInput"), cameraInput = $("cameraInput"), dropzone = $("dropzone");
const convertBtn = $("convertBtn");

function showStatus(text){ $("status").hidden=false; $("status").textContent=text; }
function hideStatus(){ $("status").hidden=true; }

function loadFile(file){
  if(!file) return;
  if(!/^image\/jpe?g$/i.test(file.type) && !/\.jpe?g$/i.test(file.name)){
    showStatus("Please choose a JPG or JPEG image.");
    return;
  }
  selectedFile=file;
  const url=URL.createObjectURL(file);
  $("preview").src=url;
  $("previewWrap").hidden=false;
  $("fileName").textContent=file.name;
  $("dimensions").textContent="Loading…";
  convertBtn.disabled=false;
  const img=new Image();
  img.onload=()=>{$("dimensions").textContent=`${img.naturalWidth} × ${img.naturalHeight} px`; URL.revokeObjectURL(url)};
  img.src=url;
  showStatus("Image loaded. Ready to convert.");
}

fileInput.addEventListener("change",e=>loadFile(e.target.files[0]));
cameraInput.addEventListener("change",e=>loadFile(e.target.files[0]));
dropzone.addEventListener("click",()=>fileInput.click());
["dragenter","dragover"].forEach(ev=>dropzone.addEventListener(ev,e=>{e.preventDefault();dropzone.classList.add("over")}));
["dragleave","drop"].forEach(ev=>dropzone.addEventListener(ev,e=>{e.preventDefault();dropzone.classList.remove("over")}));
dropzone.addEventListener("drop",e=>loadFile(e.dataTransfer.files[0]));

function drawCover(img,w,h){
  const canvas=document.createElement("canvas");
  canvas.width=w; canvas.height=h;
  const ctx=canvas.getContext("2d",{alpha:false});
  const scale=Math.max(w/img.naturalWidth,h/img.naturalHeight);
  const sw=img.naturalWidth*scale, sh=img.naturalHeight*scale;
  ctx.drawImage(img,(w-sw)/2,(h-sh)/2,sw,sh);
  return canvas;
}

function canvasToBlob(canvas,quality=.94){
  return new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error("JPEG export failed")),"image/jpeg",quality));
}

function readAsDataURL(blob){
  return new Promise((resolve,reject)=>{
    const r=new FileReader(); r.onload=()=>resolve(r.result); r.onerror=reject; r.readAsDataURL(blob);
  });
}

/*
  Browser-native JPEG export intentionally does not forge proprietary camera
  signatures. The visible metadata fields are descriptive and are kept in a
  sidecar JSON download when requested. This avoids making a converted phone
  photo falsely claim hardware provenance.
*/
async function convert(){
  if(!selectedFile)return;
  convertBtn.disabled=true;
  showStatus("Converting locally…");
  try{
    const img=new Image();
    const src=URL.createObjectURL(selectedFile);
    await new Promise((res,rej)=>{img.onload=res;img.onerror=rej;img.src=src});
    const canvas=drawCover(img,TARGET_W,TARGET_H);
    outputBlob=await canvasToBlob(canvas);
    outputDataUrl=await readAsDataURL(outputBlob);
    $("resultPreview").src=outputDataUrl;
    $("resultInfo").textContent=`JPEG • ${(outputBlob.size/1024/1024).toFixed(2)} MB`;
    $("result").hidden=false;
    showStatus("Done. The image was processed in your browser.");
    URL.revokeObjectURL(src);
  }catch(err){
    console.error(err); showStatus("Conversion failed. Try another JPG/JPEG.");
  }finally{convertBtn.disabled=false}
}
convertBtn.addEventListener("click",convert);

$("saveBtn").addEventListener("click",()=>{
  if(!outputBlob)return;
  const a=document.createElement("a");
  a.href=URL.createObjectURL(outputBlob); a.download="converted-photo-3024x4032.jpg";
  a.click(); setTimeout(()=>URL.revokeObjectURL(a.href),1000);
});

$("shareBtn").addEventListener("click",async()=>{
  if(!outputBlob)return;
  const file=new File([outputBlob],"converted-photo-3024x4032.jpg",{type:"image/jpeg"});
  if(navigator.canShare && navigator.canShare({files:[file]})){
    try{await navigator.share({files:[file],title:"Converted photo"})}catch{}
  }else showStatus("File sharing is not supported by this browser. Use Save JPG.");
});

$("base64Btn").addEventListener("click",async()=>{
  if(!outputDataUrl)return;
  try{await navigator.clipboard.writeText(outputDataUrl);showStatus("Base64 copied to clipboard.");}
  catch{showStatus("Clipboard access was blocked by the browser.");}
});
