
let API_URL = "http://localhost:8000"

function nanoid(t = 21) {
  return crypto.getRandomValues(new Uint8Array(t)).reduce((t, e) =>
    t += (e &= 63) < 36 ? e.toString(36) :
      e < 62 ? (e - 26).toString(36).toUpperCase() :
        e < 63 ? "_" : "-", "");
}

async function createSession(sitedata) {
  const data = {
    sitedata,
    website: window.location.origin,
    owner: "ownerId",
    status: "active",
    refinedSiteData: "text"
  };

  console.log({ chatdata: data })

  try {
    const response = await fetch(`${API_URL}/api/sessions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const result = await response.json();
    console.log("Success:", result._id);
    return result._id;
  } catch (error) {
    console.error("Error:", error);
  }
}

async function truncateArrayTo500(arr) {
  let joinedString = arr.join("_n_"); // Join with _n_
  if (joinedString.length <= 500) return joinedString.split("_n_"); // Return as an array if within limit
  console.log({ len: joinedString.length })

  let truncatedString = joinedString.slice(0, 500); // Cut at 500 characters

  let lastSeparator = truncatedString.lastIndexOf("_n_");
  if (lastSeparator > 0) {
    truncatedString = truncatedString.slice(0, lastSeparator); // Trim to last full section
  }
  return truncatedString.split("_n_");
}

async function extractSitemap(url) {
  try {
    let response = await fetch(url);
    if (!response.ok) throw new Error("Failed to fetch sitemap");

    let text = await response.text();
    text = text.trim().replace(/^.*?</s, "<");

    const xmlDoc = new window.DOMParser().parseFromString(text, "application/xml");
    console.log({ xmlDoc })
    console.log("Raw Response:", text);

    const parseError = xmlDoc.querySelector("parsererror");
    if (parseError) {
      console.error("XML Parsing Error:", parseError.textContent);
      return [];
    }

    const urls = [...xmlDoc.getElementsByTagName("loc")].map(loc => loc.textContent);
    let someurl = await truncateArrayTo500(urls);
    console.log("Extracted URLs:", someurl);
    return someurl

  } catch (error) {
    console.error("Error fetching sitemap:", error);
    return [];
  }
}

async function extractPageInfo() {
  let limit = 1000
  const truncate = (text, max) => text.length > max ? text.slice(0, max - 3) + "..." : text;
  const pageInfo = {
    title: truncate(document.title, 100),
    // metaDescription: truncate(document.querySelector('meta[name="description"]')?.content || "No description", 150),
    headings: [...document.querySelectorAll('h1, h2, h3, h4, h5, h6')].map(h => truncate(h.innerText, 100)),
    links: [...document.querySelectorAll('a')].map(a => ({
      text: truncate(a.innerText, 50),
      href: truncate(a.href, 100)
    })),
    paragraphs: [...document.querySelectorAll('p')].map(p => truncate(p.innerText, 200)),
    images: [...document.querySelectorAll('img')].map(img => ({
      src: truncate(img.src, 100),
      alt: truncate(img.alt || "No alt text", 50)
    }))
  };

  let jsonString = JSON.stringify(pageInfo);

  if (jsonString.length > limit) {
    jsonString = truncate(jsonString, limit);
  }
  return pageInfo;
}

async function extractData() {
  console.log("here")
  let sitemapData = await extractSitemap(window.location.origin + "/sitemap.xml");
  let pageInfo = await extractPageInfo(window.location.origin + "/index.html");
  return ({
    sitemapData,
    pageInfo
  })
}


async function getSessionId() {
  try {
    let storedSessionId = localStorage.getItem("session_id");
    let extractedData = await extractData()
    if (!storedSessionId) {

      storedSessionId = await createSession(extractedData)

      localStorage.setItem("session_id", storedSessionId);
    }
    console.log({ storedSessionId: storedSessionId.toLocaleLowerCase() })
    return storedSessionId;

  } catch (error) {
    console.log({ error })
  }
}

getSessionId();

function ChatWidget() {
  const { useState, useRef, useEffect } = React;
  const socket = io(API_URL);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef(null);



  useEffect(() => {
    socket.on("message:receive", (message) => {
      console.log({ message, messages });
      setMessages((prev) => [...prev, message.data]);
    });

    return () => {
      socket.off("message:receive");
    };
  }, []);

  function toggleChat() {
    setIsOpen(!isOpen);
  }

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  function handleInputChange(event) {
    setMessage(event.target.value);
  }

  const sendMessage = () => {
    if (!message.trim()) return;
    const userMessage = { sender_type: "customer", message, session_id: localStorage.getItem("session_id") };

    setMessages((prev) => [...prev, userMessage]);
    setMessage('');
    socket.emit("message:send", userMessage);
  };

  function handleKeyPress(event) {
    if (event.key === 'Enter' && message) {
      sendMessage();
    }
  }

  return (
    <div>
      <button id="chat-toggle" onClick={toggleChat}>💬</button>

      {isOpen && (
        <div className="chat-widget">
          <div className="chat-header">
            Chat Support
            <button onClick={toggleChat} style={{ background: 'white', color: '#007bff', border: 'none', cursor: 'pointer' }}>X</button>
          </div>
          <div className="chat-body">
            {messages.map((msg, index) => (
              <div key={index} className={`message-container ${msg.sender_type === 'customer' ? 'sent' : 'received'}`}>
                <div className="message-user">{msg.sender_type === 'customer' ? 'You' : 'AI'}</div>
                <div className="message" style={{ textAlign: msg.sender_type === 'customer' ? 'right' : 'left' }}>{msg.message}</div>
              </div>
            ))}
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
        </div>
      )}
    </div>
  );
}

ReactDOM.render(<ChatWidget />, document.getElementById('chat-container'));
