const { error } = require('console')
const express = require('express')
const { stdout, resourceUsage, nextTick } = require('process')
const util = require('util')
const dotenv = require('dotenv')
const jwt = require('jsonwebtoken')
const path = require('path')
const { userInfo } = require('os')

dotenv.config()
const app = express()
const exec = util.promisify(require('child_process').exec); // promisifying the child process returned by exec

app.use(express.static(path.join(__dirname, 'views')))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
const dir = path.join(__dirname, '/views')


//utilities

const getForwordingURL = async () => {
    try {
        let tunnels = await fetch('http://127.0.0.1:4040/api/tunnels')
        tunnels = await tunnels.json()
       
        const url = tunnels.tunnels[0].public_url
      
        return url


    }
    catch (err) {
        return err
    }

}

// preprocess task list to give all the tasks that only contain .exe
const preprocessTaskList = async (tasks) => {
    let Task = [];
    for (let task of tasks) {
        if (task.includes('.exe')) {
            if (task[0] === 'K') {
                task = task.slice(3, task.length)
            }

            Task.push(task)
        }
    }
    return Task


}






//configuration varaibles

let allowRemoteControl = true;

let mainServerUrl = "http://192.168.76.137:3000"
let forwardingURL;







const commandLine = async (command) => {

    const { stdout, error } = await exec(command)
    return { stdout, error }


}



const authorizeInternalRequest = async (req, res, next) => {


     const authHeader = req.headers['auth-token'] // Bearer token
     
    
    const token = authHeader
    if(token == null)return res.sendStatus(401)

    jwt.verify(token,process.env.SECRET_KEY , (err , user)=>
    {
        if(err) return res.sendStatus(403)
        next()
    })





}

// authorize middle ware
const authorizeIncomingRequest = async (req, res, next) => {
    if (!allowRemoteControl) {
        return res.send({ 'err': 'device status offline' })
    }

    const token = authHeader
    if(token == null)return res.sendStatus(401)

    jwt.verify(token,process.env.SECRET_KEY , (err , user)=>
    {
        if(err) return res.sendStatus(403)
        next()
    })

    




}

//client side interactions route
{

    app.get('/login', (req, res) => {
        res.sendFile(dir + '/login.html')
    })
    app.get('/batteryInfo',authorizeIncomingRequest,async(req,res)=>
    {
        const reqBatteryPercentage = await commandLine('wmic path Win32_Battery Get EstimatedChargeRemaining')
        const batteryPercentage = reqBatteryPercentage.split('\n')[1]
        const reqBatteryStatus = await commandLine('wmic path Win32_Battery Get BatteryStatus')
        const batteryStatus = reqBatteryStatus.split('/n')[1]>=2 ? 2 : 1;

      
       res.send({'batteryPercentage':batteryPercentage , 'batteryStatus' : batteryStatus })
    })

    app.post('/userInfo', async (req, res) => {
        console.log(req.body)
        if (req.body.deviceID == null) {
            const reqBatteryPercentage = await commandLine('wmic path Win32_Battery Get EstimatedChargeRemaining')
             const batteryPercentage = reqBatteryPercentage.stdout.split('\n')[1]
             const reqBatteryStatus = await commandLine('wmic path Win32_Battery Get BatteryStatus')
             const batteryStatus = reqBatteryStatus.stdout.split('/n')[1]>=2 ? 2 : 1;
             process.env.SECRET_KEY = req.body.secret
           
            process.env.userName = req.body.userName
            forwardingURL = await getForwordingURL() 
            console.log(forwardingURL)
            res.send({ 'forwardingURL': forwardingURL , 'batteryPercentage':batteryPercentage , 'batteryStatus' : batteryStatus })
        }
        else {
            
            process.env.deviceID = req.body.deviceID
      
            res.send({ stats: 'ok' })
        }
    })


    app.get('/dashboard', (req, res) => {
        res.sendFile(dir + '/dashboard.html')

    })

    app.post('/dashboard', authorizeInternalRequest, async (req, res) => {

        const stateReq = req.body.deviceState
        const jwt = req.headers['auth-token']

        if (stateReq === 'on')
            allowRemoteControl = true
        else
            allowRemoteControl = false

       

        const data = {
            'userName' : process.env.userName
         }
        
          let reqObject = {
                    method: 'PATCH',
                    headers: {
                        'content-type': 'application/json',
                        'auth-token' : jwt
        
                    },
                    body: JSON.stringify(data)
        
        
        
                }
          
          
          console.log(reqObject)
          console.log('device id',process.env.deviceID)
        
          let resMainServer = await fetch(`${mainServerUrl}/api/devices/toggleactive/${process.env.deviceID}`, reqObject)
          resMainServer = res.json()
          
         





    })
}
















//main server routes
{
    app.get('/api/shutdown', authorizeIncomingRequest, async (req, res) => {


        const jwt = req.headers.authorization
        const deleteReqObj = {
            method: 'DELTE',
            headers: {
                authorization: jwt
            },
            body: {
                userName: JSON.stringify(userName)
            }
        }
        await fetch(`${mainServerUrl}/api/devices/delete/${deviceID}`, deleteReqObj)
        res.send({ status: 'ok' })
        const { stdout, error } = commandLine('_shutdown.txt') // here i dont need to or may be i can wait for complete process to finish i.e i close txt file

    })

    app.get('/api/hibernate', authorizeIncomingRequest, async (req, res) => {
        // send hibernation success remark
        res.send({ staus: 'ok' })
        const { stdout, error } = await commandLine('_hibernate.txt')
        // when device is online send this back to the server informing about being online
        const jwt = req.headers.authorization
        const patchReqObj = {
            method: 'PATCH',
            headers: {
                authorization: jwt
            },
            body: {
                userName: JSON.stringify(userName)
            }
        }
        const toggleActivityRequest = await fetch(`${mainServerUrl}/api/devices/toggleactive/${deviceID}`, patchReqObj)



    })

    app.get('/api/tasklist', authorizeIncomingRequest, async (req, res) => {

        const { stdout, error } = await commandLine('tasklist');
        if (error) {
            res.send('error is', error)
        }
        if (stdout) {
            const lines = stdout.split('\n').slice(3, -1); // Get the lines of output, excluding the headers and footers
            const processes = lines.map(line => {
                const columns = line.trim().split(/\s+/); // Split each line into columns using any amount of whitespace as the delimiter
                return { processName: columns[0], memoryUsage: columns[4] }; // Create an object with the relevant columns
            });

            res.send({ 'processes': processes })



        }

    })

    app.get('/api/taskkill/:task', authorizeIncomingRequest, async (req, res) => {

        const task = req.params.task
        try {
            await commandLine(`taskkill /im ${task}.exe /F`)
            res.send({ status: 'ok' })
        }
        catch (err) {
            res.send({ status: 'failed', 'err': err })
        }

    })






}









app.listen('8080', (req, res) => {
    console.log('listening to port 8080')
})