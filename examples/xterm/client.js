
function XTerminal(opts){
  // Option Defaults
  var opts = {
      // SSH Connection
     username : opts.username || 'root',
     password: opts.password,
     host: opts.host,

     // Socket.io Connection
     domain : opts.domain || 'http://localhost:3000',
     path : opts.path || '/xterm/socket.io'
  }

  // Query Object
  var query = "username="+opts.username;
  if (typeof opts.host !== "undefined")
  query = query + "&host=" + opts.host;
  if (typeof opts.password !== "undefined")
  query = query + "&password=" + opts.password;

  // Create Terminal
  var terminal_container = document.getElementById('terminal');
  var terminal = new Terminal({});

  // Bind to Socket.IO
  var socket = io(opts.domain, {path : opts.path, query : query});
  socket.on('connect', () => {


    // Resize Listener
    terminal.on('resize', function (size) {
      console.log("Resize!!");
      
      socket.emit('resize', {
        cols : size.cols,
        rows : size.rows,
        height: size.height,
        width: size.width
      });
    });

    // I/O
    terminal.on('data', function (data) {
      socket.emit('input', data)
    })
    socket.on('output', function (data) {
      terminal.write(data)
    }).on('disconnect', function (err) {
      console.log(err);
      socket.io.reconnection(false);
    }).on('exception', function (err) {
      console.error(err);
      socket.io.reconnection(false);
    }).on('error', function (err) {
      console.error(err);
      socket.io.reconnection(false);
    });

    // Bind
    terminal.open(terminal_container);
    terminal.fit();
  })
}
