const db = require('../database/database');
var socketIo = require('socket.io')

/* Find all messages */
async function showMessages(req, res, next) {
  try {
    const { Message } = (await db()).models; // Destructure models from the result of db function
    const messages = await Message.findAll();
    res.render('messages.twig', { title: 'List of messages', messages: messages });
  } catch (e) {
    console.error(e);
    res.status(500).send('Error fetching messages : ' + e.message);
  }
}

/* Display create form */
async function displayCreateForm (req, res, next) {
  try {
    res.render('addMessage.twig', { title: 'Add a message'});
  } catch (e) {
    console.error(e);
    res.status(500).json({ e: 'Internal Server Error! ' + e.message});
  }
}

/* Create a new message */
async function createMessage(req, res, next) {
  try {
    const { Message } = (await db()).models;
    const { Pseudo, Content } = req.body;
    await Message.create({ Pseudo, Content });
    res.send(`
    <script>
      alert("Message successfully created and added!");
      window.location.href = '/messages'; // Redirect to the messages page
    </script>
  `);
  } catch (e) {
    console.error(e);
    res.status(500).send('Error creating message : ' + e.message);
  }
}

/* Display update form */
async function displayUpdateForm (req, res, next) {
  try {
    const { Message } = (await db()).models;
    // Assuming you send the updated comment data in the request body
    const { id } = req.params;
    // Find the comment by ID
    const messageToUpdate = await Message.findByPk(id);
    // Check if the comment exists
    if (!messageToUpdate) {
      return res.status(404).json({ error: 'Message not found!' });
    }
    res.render('updateMessage.twig', { title: 'Edit a message', message: messageToUpdate });
  } catch (e) {
    console.error(e);
    res.status(500).json({ e: 'Internal Server Error! ' + e.message});
  }
}

/* Update a message */
async function updateMessage(req, res) {
  try {
    const { Message } = (await db()).models;

    const { Pseudo, Content } = req.body;
    const { id } = req.params;

    // Find the message by ID
    const messageToUpdate = await Message.findByPk(id);

    // Check if the message exists
    if (!messageToUpdate) {
      return res.status(404).json({ error: 'Message not found!' });
    }

    // Update the message
    messageToUpdate.Pseudo = Pseudo;
    messageToUpdate.Content = Content;

    await messageToUpdate.save();
    res.send(`
    <script>
      alert("Message successfully updated!");
      window.location.href = '/messages'; // Redirect to the messages page
    </script>
  `);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal Server Error! ' + e.message});
  }
}

/* Delete a message */
async function deleteMessage(req, res, next) {
  try {
    const { Message } = (await db()).models;
    const { id } = req.params;
    // Find message by id
    const messageToDelete = await Message.findByPk(id);
    // Check if it exists
    if (!messageToDelete) {
      return res.status(404).json({ error: 'Message not found!' });
    }
    // Delete message
    await messageToDelete.destroy();
    res.send(`
      <script>
        alert("Message successfully deleted!");
        window.location.href = '/messages'; // Redirect to the messages page
      </script>
    `);
  } catch (e) {
    console.error(e);
    res.status(500).send('Error deleting message! :' + e.message);
  }
}

/* Like a message */
async function likeMessage(req, res, next) {
  try {
    const { Message } = (await db()).models;
    // Assuming you send the updated comment data in the request body
    const { id } = req.params;
    // Find the comment by ID
    const messageToUpdate = await Message.findByPk(id);
    // Check if the comment exists
    if (!messageToUpdate) {
      return res.status(404).json({ error: 'Message not found!' });
    }
    messageToUpdate.Likes += 1;
    await messageToUpdate.save();
    res.send(`
      <script>
        alert("Message successfully liked!");
        window.location.href = '/messages'; // Redirect to the messages page
      </script>
    `);
  } catch (e) {
    console.error(e);
    res.status(500).json({ e: 'Internal Server Error! ' + e.message});
  }
}

async function displayChat(req, res, next) {
  try {
    res.render('chat.twig', { title: 'Chat:'});
  } catch (e) {
    console.error(e);
    res.status(500).json({ e: 'Internal Server Error! ' + e.message});
  }
}

function socketIO(server) {
  const io = socketIo(server);

  //Broadcast user connection
  io.on("connection", (socket) => {
    console.log("User connected with socket id " + socket.id);
    socket.broadcast.emit("msg", {Pseudo: "System", Content: "A user has joined the chat."});

    // Send message and emit to everyone
    socket.on("send-msg", async (data) => {
      console.log(data);
      io.emit("msg", {Pseudo: data.Pseudo, Content: data.Content});

      const { Message } = (await db()).models;
      if (data && data.Pseudo && data.Content) {
        await Message.create({
            Pseudo: data.Pseudo,
            Content: data.Content,
        });
    } else {
        console.error('Invalid message, data received:', data);
    }
    });

    // Listen for typing
    socket.on("uTyping", (data) => {
      socket.broadcast.emit("msg-typing", data);
    });

    // Broadcast user disconnection
    socket.on("disconnect", () => {
      console.log("User disconnected with socket id " + socket.id);
      socket.broadcast.emit("msg", {Pseudo: "System", Content: "A user has left the chat."});
    });
  });

  return io;
}

module.exports = {displayCreateForm, showMessages, createMessage, displayUpdateForm,
                  updateMessage, deleteMessage, likeMessage, displayChat, socketIO};
