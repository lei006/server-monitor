
const { app, dialog, Menu, Tray, ipcMain} = require('electron')
const Store = require('electron-store');
const store = new Store();

const path = require('path');


let mainWindow = null;
let appTray = null
let ipc_render = null;


console.log("store path:", store.path)

function Start(window) {
    mainWindow = window;

    /*
    */
    ////////////////////////////////////////
    // 如果是第一次运行..
    let ret = getFirstRun();
    if(ret === true) {
      setAutoStart(true);
    }
    setTimeout(() => {
        ShowTray();
      }, 200);
    
      
}



function Stop(){

}





ipcMain.on('win_form_init', function(event, data) {
    ipc_render = event.sender;
  });
  


function getFirstRun(){
    let dir = store.get("app_first_run");
    
    store.set("app_first_run", "false")


    return dir !== "false";
}


  
  function setVirtualScreenDir(dir){
    ipc_render.send('set_virtual_screen_dir', dir);
    store.set("set_virtual_screen_dir",dir);
  }
  
  
  function getAppLanguage(){
  
    let store_language = store.get("set_language");
    if(store_language){
      return store_language;
    }
    return app.getLocale();
  }
  
  
  
  
  ipcMain.on('get_cur_language', function(event, data) {
    event.returnValue = getAppLanguage();
  });
  
  

  function getAutoStart(){



    let settings = app.getLoginItemSettings();

    return settings.executableWillLaunchAtLogin;
  }


  function setAutoStart(enable) {

    // 设置开机自起
    const exeName = path.basename(process.execPath);
    app.setLoginItemSettings({
      // 设置为true注册开机自起
      openAtLogin: enable, //
      openAsHidden: false,  //macOs
      path: process.execPath,
      args: ["--processStart", `"${exeName}"`], 
      //name:"D-Desk",
    });

    updateTrayItem_Lanuage();

  }
  

  
    var trayMenuTemplate = [    
    {
        label: '开启启动',
        submenu: [
        {
            label: '开启',
            type: 'radio',
            click: function () {
            setAutoStart(true);
            }
        },
        {
            label: '关闭',
            type: 'radio',
            click: function () {
            setAutoStart(false);
            }
        },
        ]
    },       
    {
        label: 'MonitAny v1.0.0',
        click: function () {
          dialog.showMessageBox({ type: 'info', title:"关于",message: `服务监控软件 v 1.4.14`,});
        }
    },
    {
        type: 'separator'
    }, 
    {
        label: '退出',
        click: function () {
            //ipc.send('close-main-window');
            console.log("from menu exit app!");
            appTray.destroy();
            app.exit();
        }
    }
    ];




function updateTrayItem_Lanuage(){

  let cur_autostart = getAutoStart();
  //trayMenuTemplate[5].submenu[0].checked = cur_autostart;
  //trayMenuTemplate[5].submenu[1].checked = !cur_autostart;

  //图标的上下文菜单
  const tmpContextMenu = Menu.buildFromTemplate(trayMenuTemplate);
  if(appTray) {
    appTray.setContextMenu(tmpContextMenu);
  }
}






  function ShowTray(){
      //系统托盘右键菜单

      
       //系统托盘图标目录
       let trayIcon = path.join(__dirname, '../../build/icons');
       appTray = new Tray(path.join(trayIcon, '256x256.png'));
  

       updateTrayItem_Lanuage();
        
  
       //设置此托盘图标的悬停提示内容
       appTray.setToolTip('D-desk');
  
       appTray.on("click", (event)=>{
        mainWindow.show();
       })
       
 
  
  
  }
  
  
  // 限制只可以打开一个应用, 4.x的文档
  const gotTheLock = app.requestSingleInstanceLock()
  if (!gotTheLock) {
    app.quit()
  } else {
    app.on('second-instance', (event, commandLine, workingDirectory) => {
      // 当运行第二个实例时,将会聚焦到mainWindow这个窗口
      if (mainWindow) {
        if (mainWindow.isMinimized()) mainWindow.restore()
        mainWindow.focus()
        mainWindow.show()
      }
    })
  }
  
export default {Start, Stop}

