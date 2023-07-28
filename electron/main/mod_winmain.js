


const { app, BrowserWindow, Menu, Tray, ipcMain, globalShortcut, screen } = require('electron')



//app.commandLine.appendSwitch('high-dpi-support', 1)
//app.commandLine.appendSwitch('force-device-scale-factor', 1)

//关闭加密
app.commandLine.appendSwitch('disable-webrtc-encryption', 1)
app.commandLine.appendSwitch('mse-video-buffer-size-limit', "0M")
app.commandLine.appendSwitch('mse-audio-buffer-size-limit', "0M")
//app.commandLine.appendSwitch('mse-video-buffer-size-limit', "2M")

process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';



let mainWindow = null;
let ipc_render = null;


function Start() {

  Menu.setApplicationMenu(null);
  

    const { screen } = require('electron')
    const primaryDisplay = screen.getPrimaryDisplay()

  //console.log("primaryDisplay", primaryDisplay);
  /*
  let margin = 1;
  let win_width = 480;
  let win_height = 360;

  let win_rect = {};
  win_rect.x = primaryDisplay.bounds.x + primaryDisplay.workArea.width - (win_width + margin);
  win_rect.y = primaryDisplay.bounds.y + primaryDisplay.workArea.height - (win_height + margin*1);


  win_rect.width = win_width;
  win_rect.height = win_height;
  */
  let margin = 20;

  let win_rect = {};
  win_rect.x = primaryDisplay.bounds.x + primaryDisplay.bounds.width/2 + margin;
  win_rect.y = primaryDisplay.bounds.y + primaryDisplay.bounds.height/2 - margin*3;

  win_rect.width = (primaryDisplay.workArea.width - win_rect.x - margin);
  win_rect.height = (primaryDisplay.workArea.height - win_rect.y - margin*2);


  //console.log("win_rect", win_rect);

  /**
   * Initial window options
   */
   mainWindow = new BrowserWindow({
    x:win_rect.x,
    y:win_rect.y,
    width: win_rect.width,
    height: win_rect.height,
    useContentSize: true,
    autoHideMenuBar:true,
    skipTaskbar:false,
    //alwaysOnTop:true,
    show:true,
    minimizable:true,
    maximizable:true,
    webPreferences: {

      nodeIntegration: true,   
      enableRemoteModule: true, 
      contextIsolation: false,       

    },
  })

  mainWindow.on('close', (event) => {
    console.log("close 111")
    //暂时去掉，后面要加上..
    //event.preventDefault(); //阻止关闭
    //mainWindow.hide();    
    app.exit(0)

  })

  
  mainWindow.on('minimize', () => {
    mainWindow.unmaximize();
    mainWindow.fullScreen = false;
    mainWindow.hide();
  })

  mainWindow.on('maximize', (event) => {
    //event.preventDefault(); //阻止关闭
    mainWindow.unmaximize();
    mainWindow.fullScreen = true;
    ipc_render.send('show_prompt','exit_fullscreen');
  })


  mainWindow.on('restore', () => {
    mainWindow.webContents.send('restore');
  })

  
  mainWindow.once('ready-to-show', () => {
    //mainWindow.show()
  })
  mainWindow.setSkipTaskbar(false);



    ////////////////////////////////////

    ipcMain.on('desk_win_show', function(event, data) {
      setWindowShow(data == "true");
    });


    globalShortcut.register('CommandOrControl+f10', () => {
      setWindowShow(!mainWindow.isVisible());
    })
    globalShortcut.register('CommandOrControl+f9', () => {
      //setWindowShow(!mainWindow.isVisible());
      //ipc_render.send('switch_remote_mode','');
    })

    globalShortcut.register('ctrl+alt+f9', () => {
      ipc_render.send('switch_debug','');
      console.log("switch_debug");
    })

    globalShortcut.register('ctrl+alt+f2', () => {
      mainWindow.webContents.openDevTools()
    })

    globalShortcut.register('f11', () => {
      mainWindow.fullScreen = !mainWindow.fullScreen;
      if(mainWindow.fullScreen == true) {
        ipc_render.send('show_prompt','exit_fullscreen');
      }
    })


    return mainWindow;

}



function Stop() {
    // 退出主窗口
    mainWindow.close();
}


async function setWindowShow(win_show){
  if(win_show == true) {

    let main_win_bounds = await mainWindow.getBounds();

    let main_win_at_screen = false;
    //
    const displays = await screen.getAllDisplays()
    await displays.find((display) => {
      //return display.bounds.x !== 0 || display.bounds.y !== 0
      let bounds = display.bounds;
      if( (main_win_bounds.x > bounds.x) && (main_win_bounds.x < (bounds.x + bounds.width )) ) {
        if( (main_win_bounds.y > bounds.y) && (main_win_bounds.y < (bounds.y + bounds.height )) ) {
          main_win_at_screen = true;
        }  
      }
    })

    if(main_win_at_screen == false) {
      //不在屏幕中，则把窗口移过来..
      mainWindow.setPosition(100, 100);
    }
    mainWindow.show();
  }else{
    mainWindow.hide();
  }
}



ipcMain.on('win_form_init', function(event, data) {
  ipc_render = event.sender;
});

ipcMain.on('set_content_size', function(event, {width,height}) {
    console.log('set_content_size', width, height);
    mainWindow.setContentSize(width, height);
});

ipcMain.on('desk_win_show', function(event, data) {
  setWindowShow(data == "true");
});



export default {Start, Stop}
