import POST_TYPES from "./constants.js";
import post from "./directives.js";
import Logger from "./logger.js";

const Socket = (socket, io) => {
  socket.on("join_room", (post) => {
    // - validate request

    post.rooms.forEach((room_name) => {
      socket.join(room_name);

      console.log("A user joined room:", room_name);

      // - WRITE ACCESS LOG
      const message = `---ROOM JOINED--- [ROOM NAME] : ${room_name}`;
      Logger(message, "access");
    });
  });

  socket.on("on_request", (post) => {
    const { room_name, request_type, endpoint, data } = post;

    if (["post", "get"].includes(request_type)) {
      if (request_type === POST_TYPES.get) {
        get_request(io, room_name, endpoint, data);
      } else {
        post_request(io, room_name, endpoint, data);
      }
    } else {
      io.to(room_name).emit(request_type, data);
    }
  });
};

const get_request = (io, room_name, endpoint, data) => {
  const params = {
    from_room: room_name,
    endpoint: endpoint,
    data: data,
  };

  //   - WRITE ACCESS LOG
  const message = `---GET REQUEST--- [PARAMS] ${JSON.stringify(params)}`;
  Logger(message, "access");

  post.get(params).then((res) => {
    io.to(room_name).emit("get_requests", res);
  });
};

const post_request = (io, room_name, endpoint, data) => {
  const params = {
    from_room: room_name,
    endpoint: endpoint,
    data: data,
  };

  //   - WRITE ACCESS LOG
  const message = `---POST REQUEST--- [PARAMS] ${JSON.stringify(params)}`;
  Logger(message, "access");

  post.send(params).then((res) => {
    io.to(room_name).emit("post_requests", res);
  });
};

export default Socket;
