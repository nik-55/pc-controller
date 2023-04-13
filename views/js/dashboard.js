const changestatebtn = document.getElementById('switch')
const dashboard = document.querySelector('.Dashboard')
const logoutbtn = document.getElementById('logout-btn')
const deviceNameNav = document.getElementById('deviceNameNav')
const userName = localStorage.getItem('userName')
 const jwt = localStorage.getItem('jwt')
 const deviceID = localStorage.getItem('deviceID')
 const deviceName = localStorage.getItem('deviceName')
 const statsDiv = document.querySelector('#status')
 const mainServerUrl = "http://192.168.76.137:3000"
changestatebtn.checked = true
dashboard.classList.toggle('Dashboard-toggle')
deviceNameNav.innerHTML =`#${deviceName} `

 changestatebtn.addEventListener('change',async(event)=>
 {

    const data ={
        'deviceState' : changestatebtn.checked ? 'on' : 'off'

       }
       console.log(data)
       dashboard.classList.toggle('Dashboard-toggle')
       let statsDivVal = statsDiv.innerHTML
       if(statsDivVal === 'ONLINE')
       statsDivVal = 'OFFLINE'
       else
       statsDivVal = 'ONLINE'

       statsDiv.innerHTML = statsDivVal
       



    const reqObject = {
       method : 'POST',
       headers : {
       'content-type' : 'application/json',
        'auth-token': jwt
       },
       body : JSON.stringify(data)
 }
  
     const res = await fetch('/dashboard',reqObject)


 })

 logoutbtn.addEventListener('click',async(event)=>
 {

 const data = {
    'userName' : userName
 }

  let reqObject = {
            method: 'DELETE',
            headers: {
                'content-type': 'application/json',
                'auth-token' : jwt

            },
            body: JSON.stringify(data)



        }
  
  
  console.log(reqObject)
  

  let res = await fetch(`${mainServerUrl}/api/devices/delete/${deviceID}`, reqObject)
  res = await res.json()
  
 

    localStorage.removeItem('jwt')
    localStorage.removeItem('userName')
    localStorage.removeItem('deviceID')



 
    window.location ='/login'
 })