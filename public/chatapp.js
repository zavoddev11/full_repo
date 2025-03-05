let API_URL = `https://ai.zavod-it.com`;
// let API_URL = `http://localhost:5459`;

// globalThis.socket = io(API_URL, {
//   reconnectionAttempts: 3, // Limit reconnection attempts
//   timeout: 5000, // Connection timeout
// });


function ChatWidget() {
  const { useState, useRef, useEffect } = React;
  // const socket = io(API_URL);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [Loading, setLoading] = useState("");
  const [Link, setLink] = useState("zavod-it.com");
  const [WebsiteId, setWebsiteId] = useState("");
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [typing, setTyping] = useState(false)

  const useDebounce = (fn, delay) => {
    const [timeoutId, setTimeoutId] = useState(null);

    return (...args) => {
      if (timeoutId) clearTimeout(timeoutId);

      const newTimeoutId = setTimeout(() => {
        fn(...args);
      }, delay);

      setTimeoutId(newTimeoutId);
    };
  };

  const fetchCalled = useRef(false);

  async function createSession() {
    try {
      let { link, website_id } = widget_info

      const data = {
        website_id,
        status: "active",
      };

      console.log({ website_id })

      io.set('close timeout', 60 * 60 * 24); // 24h time out

      if (website_id) {
        const response = await fetch(`${API_URL}/api/sessions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const result = await response.json();
        console.log("Success: created: session", result._id);
        let storedSessionId = result._id
        localStorage.setItem("chat___session_id", storedSessionId);

        let id = localStorage.getItem("chat___session_id")
        try {
          console.log({ id });
          let response = await fetch(`${API_URL}/api/messages/session/${id}`);
          let data = await response.json();
          if (data && data.length > 0) setMessages(data);
          setLoading("")
        } catch (error) {
          console.error("Error fetching messages:", error);
          setLoading("")
        }

      }
    } catch (error) {
      console.error("Connection error!", error);
      // alert("Failed to connect to server. Please check your internet connection.");
    }
  }

  // globalThis.socket = io(API_URL, {
  //   reconnectionAttempts: 5,
  //   reconnectionDelayMax: 5000,
  //   timeout: 5000,
  // });

  async function fetchJsonData() {
    try {

      let { link, website_id } = widget_info

      // setLink(link)

      return widget_info;

    } catch (error) {
      console.error("Error fetching JSON:", error);
    }
  }

  async function getSessionId() {
    try {
      let storedSessionId = localStorage.getItem("chat___session_id");
      console.log({ storedSessionId })
      if (!storedSessionId || storedSessionId == null || storedSessionId == "undefined" || storedSessionId == undefined) {
        storedSessionId = await createSession();
        console.log("created new one")
      } else {
        let session = await fetch(`${API_URL}/api/sessions/${storedSessionId}`);
        let data = await session.json();

        let { website_id, _id } = await data
        setWebsiteId(website_id)
        console.log({ website_id, _id })

        if (website_id !== widget_info.website_id) {
          await createSession()
        }
      }
    } catch (error) {
      console.error("Session error:", error);
      // alert("Could not establish a session. Please try again.");
    }
  }

  function reconnectSocket() {
    if (socketRef.current) {
      socketRef.current.disconnect();  // Disconnect the existing socket if any
      socketRef.current = null;  // Clear the reference
    }

    socketRef.current = io.connect(API_URL, {
      transports: ['websocket', 'polling'], // Define transports to avoid "undefined" transport warning
    });

    // Handle successful connection
    socketRef.current.on("connect", () => {
      console.log("Connected to socket server.");
      setIsConnected(true);
      // setLoading("");  // Clear loading message when connected
    });

    socketRef.current.on("message", (data) => {
      console.log('Received message:', "hello");
    });

    // Handle connection errors
    socketRef.current.on("connect_error", (error) => {
      console.error("WebSocket connection failed:", error.message);
      setIsConnected(false);
      // setLoading("Connection failed. Retrying...");  // Inform the user about connection issues
      // Optionally retry after a delay or provide an alert
      setTimeout(() => {
        socket.connect();  // Retry the connection manually after a delay
      }, 3000);
    });

    // Handle close
    socketRef.current.on("send:switch", (data) => {
      if (data.session_id === localStorage.getItem("chat___session_id"))
        setIsOpen(false)
    });

    socketRef.current.on("message:receive", (message) => {
      if (message) {
        console.log({ message, localID: localStorage.getItem("chat___session_id") })
        if (message.data.session_id == localStorage.getItem("chat___session_id")) {
          setLoading("Loading... Please wait.")
          console.log({ message, messages });

          setMessages((prev) => [...prev, message.data]);
          setLoading("")
          setTyping(false)
        }
      }
    });

    // Handle disconnection
    socketRef.current.on("disconnect", (reason) => {
      console.warn("Socket disconnected:", reason);
      setIsConnected(false);
    });
  }

  useEffect(() => {
    reconnectSocket();
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    fetchJsonData()

    // Fetch messages on first load
    async function fetchMessageBySessionID(id, checkWebsite) {
      if (widget_info.website_id !== WebsiteId) {
        await checkWebsite()
      }
      console.log({ Loading })
      setLoading("Loading New Session...")
      try {
        console.log({ id });
        let response = await fetch(`${API_URL}/api/messages/session/${id}`);
        let data = await response.json();
        if (data && data.length > 0) setMessages(data);
        setLoading("")
      } catch (error) {
        console.error("Error fetching messages:", error);
        setLoading("")
      }
    }

    let session_id = localStorage.getItem("chat___session_id");
    if (session_id !== null || session_id !== "undefined") fetchMessageBySessionID(session_id, getSessionId);

    fetchCalled.current = true;
  }, []);


  function toggleChat() {
    const socket = socketRef.current
    if (isOpen === true) {
      setIsOpen(false);
      socket.emit("send:close", localStorage.getItem("chat___session_id"))
    } else {
      setIsOpen(true);
    }
  }

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [isOpen, messages]);

  function handleInputChange(event) {
    setMessage(event.target.value);
  }

  const sendMessage = () => {
    try {
      const socket = socketRef.current;
      if (!message.trim()) return;
      const userMessage = { sender_type: "customer", message, website_id: WebsiteId, session_id: localStorage.getItem("chat___session_id") };
      setMessages((prev) => [...prev, userMessage]);
      setTyping(true)
      setMessage('');
      setLoading("Pls wait, Processing Response.")
      socket.emit("message:send", userMessage, (response) => {
      });
    } catch (error) {
      console.log("couldn't the send message")
      console.log({ error })
    }
  };

  const handleKeyPress = useDebounce((event) => {
    if (event.key === 'Enter' && message) {
      sendMessage();
    }
  }, 300);



  function ExternalLink({ url, children }) {
    const isExternal = /^https?:\/\//i.test(url);

    const finalUrl = isExternal ? url : `https://${url}`;

    return (
      <a href={finalUrl} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  }

  return (
    <div className="ai_chatbox">

      <div id="chat-toggle" >
        <div className="toggle-title">AI Bot</div>
        <button className="toggle-button" onClick={toggleChat}>
          💬
        </button>
      </div>


      {isOpen && (
        <div className=" chat-widget">
          <div className="chat-header">
            AI Chat Support
            <button onClick={toggleChat} style={{ background: 'white', color: '#007bff', border: 'none', cursor: 'pointer' }}>X</button>
          </div>


          {/* <div className={`connection_status ${Loading || !isConnected ? " inactive_connection" : ""} `} >
            {Loading ? Loading : !isConnected ? "No internet connection..." : ""}
          </div> */}
          <div className={`connection_status ${!isConnected ? " inactive_connection" : ""} `} >
            {!isConnected ? "No internet connection..." : ""}
          </div>

          <div className="chat-body">
            {/* {Loading} */}
            <div style={{ padding: "10px" }}>
              {messages.map((msg, index) => (
                <div key={index} className={`message-container ${msg.sender_type === 'customer' ? 'sent' : 'received'}`}>
                  <div className="message-user">{msg.sender_type === 'customer' ? 'You' : 'AI'}</div>
                  <div className="message" style={{ textAlign: msg.sender_type === 'customer' ? 'right' : 'left' }}>{msg.message}</div>
                </div>
              ))}
            </div>

            <div ref={messagesEndRef} />
            <div className="ai_typing ">
              {typing &&
                <div className="floating-text">
                  <div class="typing-indicator">
                    <span style={{ marginRight: "3px" }} className="backslant">AI is typing</span>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                  </div>
                </div>}
            </div>
          </div>
          <div className="chat-footer">
            <input
              className="chat-input"
              type="text"
              placeholder="Type a message..."
              value={message}


              onKeyPress={handleKeyPress}
              onChange={handleInputChange}
            />
            <button className="send-btn" onClick={sendMessage}>➤</button>
          </div>

          <div className="poweerBy">Powered by: <div>

            <ExternalLink url={Link}>{Link}</ExternalLink>

          </div></div>

        </div>
      )
      }
    </div >
  );
}

ReactDOM.render(<ChatWidget />, document.getElementById('chat-container'));
