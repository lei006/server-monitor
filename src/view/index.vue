<template>
  <div class="dashboard-container">
    1111111111111111
  </div>
</template>

<script>

import { ipcRenderer } from 'electron'

export default {
  name: 'Dashboard',
  components: { },
  data(){
    return {
      name:"",
      count:1,
      visibleModule:false,
      state:{
        local_desk_num:0,   //本地DESK数量
        remote_desk_exist:false,  //是否存在远程DESK
        webrtc_connected:false,   // WEBRTC是否连接
      },
      local_screen_info:{},
      app_debug:false,
      
    }
  },

  mounted(){

    let mqtt_port = 1883;

    //////////////////////////////////////////////////////////////////////////
    // 1. 启动 helper 并连接
    //////////////////////////////////////////////////////////////////////////
    ipcRenderer.send("start_helper", {port:mqtt_port});
    this.bus_local.connect("127.0.0.1",mqtt_port);

    // 1. win form 初始化
    ipcRenderer.send("win_form_init", {port:123});



    this.listen_bus_local_event();
    this.listen_ipc_event();


  },
  methods:{
 
    listen_bus_local_event(){
      let _self = this;
      
      this.bus_local.on('connect', function(data) {

      })




    },

    listen_ipc_event() {
      let _self = this;
			ipcRenderer.on('switch_debug', (event, cur_language) => {
        _self.app_debug = !_self.app_debug;
			});


      ipcRenderer.on('webrtc_reconnect', (event, state) => {
        _self.$refs.webrtcScreen.connectRemoteWebRtc();
      });

      ipcRenderer.on('webrtc_disconnect', (event, state) => {
        _self.bus_remote.emit("webrtc_disconnect", "webrtc_disconnect");
        _self.$refs.webrtcScreen.stop();
      });


    },
    
    onConnectRemote() {
      this.$refs.webrtcScreen.connectRemoteWebRtc();
    },

    onWebrtcConnectionChange(is_connected){
      let _self = this;

      this.state.webrtc_connected = is_connected;
      if(is_connected === true) {

          //已经与远程，建立了 MQ连接
            // 1. 启动虚拟屏
            _self.$refs.virtualScreen.start();

            // 2. 启动黏贴板同步
            _self.$refs.clipboard.start();

            // 3. 菜单灰化--发送系统控制
            ipcRenderer.send("set_enable__system_key", {model: false });                

      }else{
          // MQ连接 已经断开
          _self.$refs.virtualScreen.stop();

          //清理文件传输
          _self.$refs.fileCopyTask.clearAll();

            // 2. 关闭黏贴板同步
          _self.$refs.clipboard.stop();

          // 3. 菜单有效--发送系统控制
          ipcRenderer.send("set_enable__system_key", {model: true });

      }



    },

    onMouseInRemote(data){
      this.mouseAtWebrtcScreen = data;
    },

  }







}

</script>

<style lang="scss" scoped>

  .dashboard-container {
    width:100%;
    height:100%;
    background-color: gray;
    overflow: hidden;
  }















</style>
