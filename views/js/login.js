const loginForm = document.getElementById('login-form')

const mainServerUrl = "http://192.168.76.137:3000"
loginForm.addEventListener('submit', async (event) => {


    try {
        event.preventDefault()



        const username = event.target.username.value
        const password = event.target.password.value
        const deviceName = event.target.deviceName.value




        let data = {
            'name': username,
            'pwd': password,
            // 'deviceName': deviceName
        }



        // fetching jwt and authentication from main server
        let reqObject = {
            method: 'POST',
            headers: {
                'content-type': 'application/json',

            },
            body: JSON.stringify(data)



        }


        let resMainServer = await fetch(`${mainServerUrl}/api/auth/login`, reqObject)

        resMainServer = await resMainServer.json()
        console.log(resMainServer)





        if (resMainServer['auth-token'] == null) {
            // window.location ='/login'
            console.log('authentication err')

        }
        else {
            // now we are authenticated , so we make sure our secret is recieved by the local server and 
            localStorage.setItem('userName', username)
            localStorage.setItem('deviceName', deviceName)
            const jwt = resMainServer['auth-token']
            localStorage.setItem('jwt', jwt)
            const secret = resMainServer.secret
            localStorage.setItem('secret', secret)


            data = {
                'secret': secret,
                'userName': username

            }

            reqObject = {
                method: 'POST',
                headers: {
                    'content-type': 'application/json',


                },
                body: JSON.stringify(data)



            }

            console.log('here')
            console.log(data)

            let resLocalserver = await fetch('/userInfo', reqObject)
            resLocalserver = await resLocalserver.json()






            data =
            {
                'userName': username,
                'deviceName': deviceName,
                'url': resLocalserver['forwardingURL'],
                'batteryPercentage': resLocalserver['batteryPercentage'],
                'batteryStatus': resLocalserver['batteryStatus']
            }
  console.log(jwt)
            reqObject = {
                method: 'POST',
                headers: {
                    'content-type': 'application/json',
                    'auth-token': jwt

                },
                body: JSON.stringify(data)



            }

            let finalResMainServer = await fetch(`${mainServerUrl}/api/devices/newdevice`, reqObject)
            finalResMainServer = await finalResMainServer.json()
            const deviceID = finalResMainServer.deviceId
            
            localStorage.setItem('deviceID', deviceID)


            data =
            {
                'deviceID': deviceID
            }

            reqObject = {
                method: 'POST',
                headers: {
                    'content-type': 'application/json',


                },
                body: JSON.stringify(data)
            }
            let finalResLocalServer = await fetch('/userInfo', reqObject)
            finalResLocalServer = await finalResLocalServer.json()


           window.location = `/dashboard?deviceName=${deviceName}`



        }
    }
    catch (err) {
        console.log(err)
    }






    return


})






