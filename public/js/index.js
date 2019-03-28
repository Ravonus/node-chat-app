var socket = io();

function scrollToBottom() {
  //Selectors
  var messages = jQuery('#messages');
  var newMessage = messages.children('li:last-child');
  // Heights
  var clientHeight = messages.prop('clientHeight');
  var scrollTop = messages.prop('scrollTop');
  var scrollHeight = messages.prop('scrollHeight');
  var newMessageHeight = newMessage.innerHeight();
  var lastMessageHeight = newMessage.prev().innerHeight();
  if (clientHeight + scrollTop + newMessageHeight + lastMessageHeight >= scrollHeight) {
    messages.scrollTop(scrollHeight);
  }
}

socket.on('connect', function () {


  socket.emit('home', function (err, rooms) {
    if (err) {
      alert(err);
    } else {
      rooms.forEach(room => {
        roomList(room, 'connect');
      });

    }
  });
});

let oneRun;
socket.on('newRoom', function (obj) {
  
  oneRun = false;

  if (obj.type === 'disconnect') {

    roomList([], obj.type, obj.room);

  } else {

    obj.rooms.forEach(room => {
      roomList(room, obj.type, obj.room);
    });

  }

});

socket.on('disconnect', function () {
  console.log('Disconnected from server');
  var divs = document.getElementsByClassName("myBox");
  divs[0].innerHTML = ''

});

//roomlist add or remove

function roomList(name, type, room) {
  if(name === 'home') return;
  name = name && !Array.isArray(name) ? name : room;
  var found = false;
  if (type !== 'disconnect') {
    var roomList = document.createElement('DIV');
    roomList.onclick = function (event) {
      let room = event.target.innerText;

      document.getElementById("room").value = room;
      document.getElementById("name").focus(); 

    };
    var h3 = document.createElement('H3');
    h3.innerText = name;
    h3.classList.add("list");
    roomList.append(h3);

  }
  var divs = document.getElementsByClassName("myBox")[0].children;
  if (type === 'connect') document.getElementsByClassName("myBox")[0].append(roomList);
  if(divs.length === 0) document.getElementsByClassName("myBox")[0].append(roomList);
  Object.keys(divs).forEach((divIndex, index) => {
    let div = divs[divIndex];
    if (div.innerText === name) found = true;
    if (index === divs.length - 1 && !found && type !== 'disconnect') document.getElementsByClassName("myBox")[0].append(roomList);

    if (type === 'disconnect' && div.innerText === name) {

      div.remove()

    }

  });

}