const { Router } = require("express");
const router = Router();
const axios = require('axios');
const fs = require('fs');
const path = require('path');
var serverStatus = 'IDLE';


router.get('/', async(req, res) => {
    console.log('conexion a player1')
    res.send('hello')
})

router.post('/challenge', async (req, res) => {
    try{
        const resp = await axios.post('http://localhost:3002/player2/challenge', {
            msg: "lets play"
        })
        if(resp.data.status === "SUCCESS"){
            serverStatus = 'WAITING RULES'
            res.status(200).send('OK')
        } 
        
    } catch(error){
        console.log(error)
    }
})

router.post('/rules', async(req, res) => {
    let rulesP2 = req.body.rules
    serverStatus = 'WAITING RULES'
    console.log('reglas p2', rulesP2)
    console.log('status P1', serverStatus)
    try {
        if(Object.keys(rulesP2).length === 3 && serverStatus === 'WAITING RULES') {
            serverStatus = 'SETTING UP'
            //TODO: subir grilla
            res.status(200).json({
                status: 'SUCCESS',
            })
        }
        else{
            throw new Error('Rules incomplete')
        }
    } catch (error) {
        console.log('error /rules p1', error.message)
        res.status(404).send(error)
    }
    
});

router.post('/init', async(req, res) => {

    try {
        const { positions } = req.body;
        const reqPath = path.join(__dirname, '../uploads/positionP1.txt');
        
        if(serverStatus === 'RIVAL WAITING' || serverStatus === 'SETTING UP'){
            serverStatus = 'PROCESSING PLACEMENT'
            //TODO: subir a la grilla las posiciones por cada uno de los elementos del array 
            fs.writeFileSync(reqPath, JSON.stringify(positions))
            serverStatus = 'WAITING RIVAL'
            res.status(200).send('OK')
        } else{
            throw new Error('Server is not on the mood')
        }
    } catch (error) {
        console.log('error /init p1', error.message)
        res.status(404).send(error)
    }

});

// //TODO: este ready es necesario?
// router.post('/ready', async(req, res) => {

//     try {
                
//         const resp = await axios.post('http://localhost:3002/player2/ready', {message: "ready"})
//         if(resp.serverStatus=== 'SENDING SHOT') {
//             serverStatus = 'WAITING SHOT'
//         }
        
//         res.status(200).send('OK')
//     } catch (error) {
//         console.log('error /ready p1', error.message)
//     }    
    
// })

router.post('/shot/:X/:Y', async(req, res) => {

    const { X, Y} = req.params;
    const positionShot = X+Y;


    try {
        // leer el archivo de posiciones del Rival ? y ver si las posiciones que
        // llegan por params coinciden con alguna
        const reqPath = path.join(__dirname, '../uploads/positionP2.txt');
        const data = fs.readFileSync(reqPath, 'utf8');
        console.log(JSON.parse(data));
    } catch(error){
        console.log(error);
    }
})


router.post('/yield', async(req, res) => {
    serverStatus = 'IDLE';
})


module.exports = router;