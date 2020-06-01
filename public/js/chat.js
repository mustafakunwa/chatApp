const socket = io();

//Elements
const $messageForm = document.querySelector('#messageForm');
const $messageFormInput = $messageForm.querySelector('input');
const $messageFormButton = $messageForm.querySelector('button')
const $locationButton = document.querySelector('#shareLocation');
const $messages = document.querySelector('#messages');

//Template
const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationTemplate = document.querySelector('#location-template').innerHTML;

//Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

socket.on("message", (message) => {
    console.log(message)
    const html = Mustache.render(messageTemplate, {
        user: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    });
    $messages.insertAdjacentHTML('beforeend', html);
})

socket.on("locationMessage", (message) => {
    const html = Mustache.render(locationTemplate, {
        user: message.username,
        url: message.url,
        createdAt: moment(message.createdAt).format('h:mm a')
    });
    $messages.insertAdjacentHTML('beforeend', html);
})


$messageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    $messageFormButton.setAttribute('disabled', 'disabled')
    const message = e.target.elements.message.value;
    socket.emit("sendMessage", message, (error) => {
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = "";
        $messageFormInput.focus();
        if (error)
            return console.log('Acknoowledge:', error)
        return console.log('message delivered')
    })
})

$locationButton.addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('geolocation is not supported')
    }
    $locationButton.setAttribute('disabled', 'disabled')
    navigator.geolocation.getCurrentPosition((position) => {
        $locationButton.removeAttribute('disabled')
        socket.emit("sendLocation", { lat: position.coords.latitude, lng: position.coords.longitude }, (error) => {
            if (error)
                console.log('error')
            console.log('location shared')
        })
    })
})

socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error);
        location.href = '/index.html'
    }
})