
let Mqtt = require('mqtt');



function MqttBus(){
    this._events = Object.create(null);
}

MqttBus.prototype.on = function(eventName, callback){
    if(!this._events){
        this._events = Object.create(null);
    }

    if(this._events[eventName]){
        this._events[eventName].push(callback);
    }else{
        this._subscribe(eventName);
        this._events[eventName] = [callback];
    }
}

MqttBus.prototype.once = function(eventName, callback){
    let one = ()=>{
        callback();
        this.off(eventName, one);
    }
    one.l = callback;
    this.on(eventName, one);
}


MqttBus.prototype.off = function(eventName,callback){

    
    if(this.mqtt_client) {
        this.mqtt_client.unsubscribe(eventName)
    }

    if(this._events[eventName]){
        this._events[eventName].filter(fn=>{
            return fn != callback && fn.l != callback;
        })
    }
}


//外部发布....
MqttBus.prototype.emit = function(topic, message){
    if(this.mqtt_client) {
        this.mqtt_client.publish(topic, message) // 远端连接通知
    }else{
        //console.warn("mqtt bus 未连接", topic,message);
    }
}

//内部有事件发生..
MqttBus.prototype._emit = function(eventName, ...args){
    if(this._events[eventName]){
      this._events[eventName].forEach(fn => fn(...args));
    }
}


MqttBus.prototype.connect = function(ip,port){


    var mqtt_url = `mqtt://${ip}:${port}`;
    if(this._mqtt_url === mqtt_url){

        if(this.mqtt_client.connected == true)
        {
            return;
        }
    }
    
    this._mqtt_url = mqtt_url;
    this.ip = ip;
    this.port=port;

    this.end();
    this._connect();
}

MqttBus.prototype.reconnect = function(){
    this.end();
    this._connect();    
}

MqttBus.prototype._connect = function(){

    let mqtt_url = this._mqtt_url;
    let ip = this.ip;
    let port = this.port;
    let _self = this;
    
    let mqtt_client = Mqtt.connect(mqtt_url);   //指定服务端地址和端口
    mqtt_client.on('connect', async function (e) {
        for (const topic in _self._events) {
            if(topic !== "connect" && topic != "end"){
                _self._subscribe(topic);
            }
        }
        _self._emit('connect', {url:mqtt_url, ip, port});
    })
    mqtt_client.on("message", async function(topic, message){
        let msg = message.toString();

        _self._emit(topic, msg);
    })
    
    mqtt_client.on('end', function (e) {
        _self._emit('end');
    });


    this.mqtt_client = mqtt_client;

}


MqttBus.prototype.end = function(){
    if(this.mqtt_client) {
        this.mqtt_client.end();
        this.mqtt_client = undefined;
        this._mqtt_url = undefined;
    }
}

MqttBus.prototype._subscribe = function(topic, opts){
    if(this.mqtt_client) {
        opts = opts || {qos: 1};
        this.mqtt_client.subscribe(topic, opts) // 远端连接通知
    }
}

MqttBus.prototype._unsubscribe = function(topic){
    if(this.mqtt_client) {
        this.mqtt_client.unsubscribe(topic)
    }
}



let install = function (Vue) {
	// 设置eventBus
	Vue.config.globalProperties.bus_local = new MqttBus();
	Vue.config.globalProperties.bus_remote = new MqttBus();
}

export default { install };



