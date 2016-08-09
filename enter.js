var express = require("express"),
    http = require("http"), 
    cors = require("cors"),
    app = express();

var dispositivo = '0-5MBQ';
var open = false;
app.use(cors());
     
function formatTime(unixTimestamp) {

    var meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    var dt = new Date(unixTimestamp);
    var day = dt.getDate();
    var monthIndex = dt.getMonth();
    var year = dt.getFullYear();

    var hours = dt.getHours();
    var minutes = dt.getMinutes();
    var seconds = dt.getSeconds();

    // the above dt.get...() functions return a single digit
    // so I prepend the zero here when needed
    if (hours < 10) 
     hours = '0' + hours;

    if (minutes < 10) 
     minutes = '0' + minutes;

    if (seconds < 10) 
     seconds = '0' + seconds;

    return hours + ":" + minutes + ":" + seconds + " el " + day + " de " + meses[monthIndex] + " de " + year;
}       

 



/********************************************************************************************/
function getAlerts() {         
                
datos = "";
var optionsAlert = {
   // host : 'www-proxy.us.oracle.com', // here only the domain name
    host : 'localhost',
    port : 7101,
    path : 'http://localhost:7101/iot/api/v2/apps/0-AE/messages?type=ALERT', // the rest of the url with parameters if needed
    method : 'GET', // do GET
    auth: 'iot:welcome1',
    headers: {
       Host: 'localhost'
    }
};


// do the GET request
var reqAlert = http.request(optionsAlert, function(resAlert) {

    resAlert.on('data', function(d) {
        datos += d;
    });

    resAlert.on('end', function(d) {
    datosAlert = JSON.parse(datos); 
    var ultimoAlerta = 0;
       
    for (i =0; i < datosAlert.items.length; i++) {
        if (datosAlert.items[i].source != dispositivo ) { continue; }
        if (datosAlert.items[i].receivedTime > ultimoAlerta) {
             console.info(datosAlert.items[i].source + ':' + datosAlert.items[i].receivedTime + ':' + datosAlert.items[i].payload.format + ':' + datosAlert.items[i].payload.data.open);    
             ultimoAlerta =  datosAlert.items[i].receivedTime;
             open = datosAlert.items[i].payload.data.open;
        }
    }
     
          
                
    });
    resAlert.on('error', function(e) {
        console.info('ERROR:\n');
        console.info(e);
                 
    });

});

reqAlert.end();

}

/***********************************************************************************************/
/*************************************************************************************/

app.get('/smart_fridge', function(req,res) {
 
getAlerts();
setTimeout(function() {
    res.writeHead(200, {"Content-Type": "application/json"}); 
    var respuesta = "";
    if (open) { respuesta = 'true';}  else { respuesta = 'false';} 
    res.end(JSON.stringify(respuesta)); 

}, 2000);

});

app.listen(3000);
console.log("Node server running on http:localhost:3000");
 