// The poor man's jQuery
window.$ = (query, el=document)=>{
    return document.querySelector(query);
};

// Boop
$("#submit").onclick = ()=>{

    let formData = new FormData();
    formData.append('subscribeField', 'aiSafetyRegisteredAt'); // list to sub to
    formData.append('email', document.querySelector("#email").value); // their email

    let xhr = new XMLHttpRequest();
    xhr.open('POST', 'https://loops-api-service.hackclub.dev/api/subscribe');
    xhr.send(formData);
    xhr.onload = function() {
        if (xhr.status != 200) { // analyze HTTP status of the response
            alert(`Error ${xhr.status}: ${xhr.statusText}`); // e.g. 404: Not Found
        } else {
            alert(`Done, got ${xhr.response}`); // response is the server response
        }
    };

    xhr.onerror = function() {
        alert("Request failed");
    };

}