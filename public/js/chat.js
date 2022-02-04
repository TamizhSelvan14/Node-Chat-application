//client side code
const socket=io()

//elements to use
const $messageForm=document.querySelector('#message-form')
const $messageFormInput=$messageForm.querySelector('input')
const $messageFormButton=$messageForm.querySelector('button')

const $messages=document.querySelector('#messages')

//templates
const messageTemplate=document.querySelector('#message-template').innerHTML
const locationMessagTemplate=document.querySelector('#location-message-template').innerHTML
const sidebarTemplate=document.querySelector('#sidebar-template').innerHTML


//rooms
const {username,room }=Qs.parse(location.search,{ignoreQueryPrefix:true})



const autoscroll = () => {
    // New message element
    const $newMessage = $messages.lastElementChild

    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    // Visible height
    const visibleHeight = $messages.offsetHeight

    // Height of messages container
    const containerHeight = $messages.scrollHeight

    // How far have I scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}

socket.on('message',(message)=>{

    console.log(message) //here welcome message print
    const html=Mustache.render(messageTemplate,{ //responsible for the messages to print in the screen
        username:message.username,
        message :message.text,
        createdAt : moment(message.createdAt).format('h:mm  a') //uses moment library 
    })
$messages.insertAdjacentHTML('beforeend',html)
autoscroll()

})


socket.on('Locationmessage',(urlpassed)=>{
    console.log(urlpassed)
    const html=Mustache.render(locationMessagTemplate,{
        username:message.username,
        url:urlpassed.text,
        createdAt:moment(urlpassed.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)

    //calling autoscroll 
    autoscroll() 
})

//printd the names of the users
socket.on('roomData',({room,users})=>{
    const html=Mustache.render(sidebarTemplate,{
        room,
        users
    })
    document.querySelector("#sidebar").innerHTML=html
})




$messageForm.addEventListener('submit',(e)=>{

    e.preventDefault()//prevents the automayic load of webpage

    $messageFormButton.setAttribute('disabled','disabled') //disabling the message send button for some moment

    const message=e.target.elements.message.value  //gets value from  the textbox

    socket.emit('sendMessage',message,(error)=>{

    $messageFormButton.removeAttribute('disabled') //removing the disabled freeze 
    $messageFormInput.value='' //setting the value to empty
    $messageFormInput.focus() //focus in the textbox




    if(error){
        return console.log(error) //here error is foul language
    }
    console.log('message deleivered')

}) //sends message to the server

})

const $sendLocationButton=document.querySelector('#send-location')
// const $sendLocationButton=$sendLocation.querySelector('button')

$sendLocationButton.addEventListener('click',(e)=>{
    if(!navigator.geolocation){
        return alert('your browser doesnt support the location')
    }

$sendLocationButton.setAttribute('disabled','disabled') //pauses a sec for the send location button

    navigator.geolocation.getCurrentPosition((position)=>{
        socket.emit('sendlocation',{
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        },()=>{
                console.log('Location shared')
                $sendLocationButton.removeAttribute('disabled') //reo=moves the pause

            })
    })

})

//this allows to block the users withbsame user name and return to the home page
socket.emit('join',{username,room},(error)=>{
    if(error){
        alert(error)
        location.href='/'
    }
})