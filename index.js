import express from "express";
import { Server } from "socket.io";
import cors from "cors";
import http from "https";
import axios from "axios";
import fs from "fs"

const app = express();
const PORT = 8000;

const serverOptions = {
  key: fs.readFileSync('C:/Certbot/live/api-eomegajr.site/privkey.pem'),
  cert: fs.readFileSync('C:/Certbot/live/api-eomegajr.site/fullchain.pem')
};

const server = http.createServer(serverOptions, app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

app.use(cors());

// add this
app.get("/socket.io/socket.io.js", (req, res) => {
  res.sendFile(__dirname + "/node_modules/socket.io/client-dist/socket.io.js");
});
///

app.get("/", (req, resp) => {
  console.log("a user visited the index page");
  resp.send({
    message: "Unauthorized Access",
    status: false
  });
});

io.on("connection", (socket) => {
  console.log("user connected!");

  get_queues(socket);

  socket.on("update queue", (post) => {
    console.log(post);
    update_queues(io, post);
  });
});

server.listen(PORT, () => {
  console.log(`listening on http://localhost:${PORT}`);
});

let base_url = "https://eomegajr.tech/demo/salon_queing_system/";

const update_queues = (io, post) => {
  const data = { 
    employee_id: post.employee_id,
    queue_position: post.queue_position,
    service_type: post.service_type,
   };
   base_url = post.base_url_referrer

   console.log("post data", data);
  send_axios({ url: "queue/update_queue", params: data })
    .then((res) => {
      console.log("res", res.data);
      if (res) {
        if (!res.data.status) {
          io.emit("update queue", res.data);
        } else {
          io.emit("update queue", res.data.queues);
        }
      }
    })
    .catch((err) => {
      console.log("ga error oy");
    });
};

const get_queues = async (socket) => {
  const res = await get_axios("queue/get_queues");
  if (res) {
    socket.emit("get queues", res.data);
  }
};

const send_axios = async (data) => {
  const headers = {
    "Content-Type": "application/json", // Adjust content type if needed
  };
  return axios
    .post(base_url + data.url, data.params, headers)
    .then((res) => {
      return res;
    })
    .catch((err) => {
      console.log("error sending post", err);
    });
};

const get_axios = (endpoint) => {
  return axios
    .get(base_url + endpoint)
    .then((res) => {
      return res;
    })
    .catch((err) => {
      console.log("err get axios", err);
    });
};
