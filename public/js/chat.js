const socket = io()

const $submitForm = document.querySelector('#submit-form')
const $messageInput = $submitForm.querySelector('input')
const $messageButton = $submitForm.querySelector('button')

const $sendLocationBtn = document.querySelector('#send-location')
const $sidebar = document.querySelector('#sidebar')

const $messages = document.querySelector('#messages')
const $messageTemplate = document.querySelector('#message-template').innerHTML
const $locationTemplate = document.querySelector('#location-template').innerHTML
const $sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

const { username, room } = Qs.parse(location.search, {ignoreQueryPrefix: true})

const autoScroll = () => {
    const $newMessage = $messages.lastElementChild

    const newMessageStyle = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyle.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    const visibleHeight = $messages.offsetHeight

    const containerHeight = $messages.scrollHeight

    const scrollOffset = $messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}

socket.on('message', message => {
    console.log(message)

    const html = Mustache.render(
        $messageTemplate,
        {
            username: message.username,
            message: message.text,
            createdAt: moment(message.createdAt).format('DD/MM/YYYY h:mm')
        }
    )

    $messages.insertAdjacentHTML('beforeend', html)
    autoScroll()
})

socket.on('shareLocation', message => {
    const html = Mustache.render(
        $locationTemplate,
        {
            username: message.username,
            url: message.url,
            createdAt: moment(message.createdAt).format('DD/MM/YYYY h:mm')
        }
    )

    $messages.insertAdjacentHTML('beforeend', html)
    autoScroll()
})

socket.on('roomData', ({ room, users }) => {
    const html = Mustache.render(
        $sidebarTemplate,
        {
            room,
            users
        }
    )

    $sidebar.innerHTML = html
})

$submitForm.addEventListener('submit', (event) => {
    event.preventDefault();
    $messageButton.setAttribute('disabled', 'disabled')

    socket.emit('emitMessage', event.target.elements.message.value, (error) => {
        $messageButton.removeAttribute('disabled')
        $messageInput.value = ''
        $messageInput.focus()

        if (error) {
            return console.log(error)
        }

        console.log('Msg was delivered')
    })
})

$sendLocationBtn.addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('User geolocation is not allow')
    }

    $sendLocationBtn.setAttribute('disabled', 'disabled')

    navigator.geolocation.getCurrentPosition(position => {
        socket.emit(
            'emitLocation',
            { longitude: position.coords.longitude, latitude: position.coords.latitude },
        () => {
            console.log('Location was shared!')
            $sendLocationBtn.removeAttribute('disabled')
        })
    })
})

socket.emit('join', { username, room }, error => {
    if (error) {
        alert(error)
        location.href = '/'
    }
})
