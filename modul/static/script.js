async function analyze(){

let file = document.getElementById("fileInput").files[0];

if(!file){
alert("Please upload a document");
return;
}

let formData = new FormData();
formData.append("file", file);

const response = await fetch("http://127.0.0.1:5000/analyze",{
method:"POST",
body:formData
});

const data = await response.json();

document.getElementById("topic").innerText = data.topic;
document.getElementById("priority").innerText = data.priority;

let priority = data.priority.toLowerCase();

document.getElementById("priority").className = "badge " + priority;

}