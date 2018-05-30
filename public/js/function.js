
function CreateImg(x)
{
    var imageNameJson;
    $.getJSON("/getImageNameJson", function(json){//从服务器端获取json数据
        imageNameJson=json;
//        alert(imageNameJson[0].imagePath);
        for(var i=0;i<x;i++)
        {
            var k=1;
            if(i%2==1)
            { k=2; }
            //生成IMG
            var strImage =  document.createElement("img");
//            strImage.id=imageNameJson[i].imageName;
            strImage.style.width="512px";
            strImage.style.height="384px";
            strImage.style.float="left";
            strImage.src="/show/"+imageNameJson[i].imageName;
            strImage.style.zIndex=1;
            //生成BUTTON
            var strButton =  document.createElement("input");
            var ID=strButton.id=imageNameJson[i].imageName;
            strButton.type="button";
            strButton.value="X";
            strButton.style.zIndex=3;
            strButton.style.position="absolute";
            if(k==1)
            {strButton.style.left="489px";}
            else{strButton.style.left="1011px";}
            strButton.style.marginTop="0px";
            strButton.style.backgroundColor="transparent";
            strButton.onclick=new Function("location.href ='/delete/"+ID+"'");
            //生成DIV
            var strDiv =  document.createElement("div");
            strDiv.style.width="522px";
            strDiv.style.height="394px";
            strDiv.style.float="left";
            //应用
            var imageDiv=document.getElementById("divImage");
            imageDiv.a(strDiv);
            strDiv.a(strImage);
            strDiv.a(strButton);
        }
    });
}
function deleteImage(x)
{
    window.location= "http://localhost:3000/delete/"+x;
}
function redirect()
{
    window.location= "http://localhost:3000/upload";
}
function check()
{
    var obj=document.getElementById("fileField");
    var fso=new ActiveXObject("Scripting.FileSystemObject");
    var image=fso.GetFile(obj.value);
    if(image.size==0)
    {
        alert("请选择需要上传的图片！");
    }
}

// document.getElementById('summernote').click = function(){
//     alert('11');
// }