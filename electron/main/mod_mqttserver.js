
const aedes = require('aedes')()
 
function Start(port){

    const server = require('net').createServer(aedes.handle)

    server.listen(port, function () {
        console.log('mqtt server listening At:', port)
      });
       
      // 身份验证
      aedes.authenticate = function (client, username, password, callback) {
        //callback(null, (username === 'user' && password.toString() === '123456'));
        callback(null, true);
    }
       
      // 客户端连接
      aedes.on('client', function (client) {
          console.log('Client Connected: \x1b[33m' + (client ? client.id : client) + '\x1b[0m', 'to broker', aedes.id);
      });
      
      
      // 客户端断开
      aedes.on('clientDisconnect', function (client) {
          console.log('Client Disconnected: \x1b[31m' + (client ? client.id : client) + '\x1b[0m', 'to broker', aedes.id);
      });
}


function Stop(){

}


export default {Start, Stop}



