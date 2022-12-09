var stored = chrome.storage.local.get('decodedItems', function (items) {
    var div=document.createElement("div"); 
    document.body.appendChild(div);
    div.innerText=items.decodedItems;
    
    console.log(items);
});

// var div=document.createElement("div"); 
// document.body.appendChild(div); 
// div.innerText='1234';

// const modal = document.querySelector(".modal");
// const trigger = document.querySelector(".trigger");
// const closeButton = document.querySelector(".close-button");

// function toggleModal() {
//     modal.classList.toggle("show-modal");
// }

// function windowOnClick(event) {
//     if (event.target === modal) {
//         toggleModal();
//     }
// }

// trigger.addEventListener("click", toggleModal);
// closeButton.addEventListener("click", toggleModal);
// window.addEventListener("click", windowOnClick);