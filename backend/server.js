import http from "node:http";
import { json } from "co-body";
import { query } from "./db.js";

const server = http.createServer(async (req, res) => {

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");


  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  res.setHeader("Content-Type", "application/json");


  if (req.url === "/users" && req.method === "GET") {
    try {
      const { rows } = await query("SELECT id, username, email FROM users ORDER BY id ASC");
      res.writeHead(200);
      res.end(JSON.stringify(rows));
    } catch (error) {
      res.writeHead(500);
      res.end(JSON.stringify({ error: error.message }));
    }
  }


  else if (req.url === "/register" && req.method === "POST") {
    try {
      const body = await json(req);
      const { username, email, password } = body;

      const { rows } = await query(
        "INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email",
        [username, email, password]
      );

      res.writeHead(201);
      res.end(JSON.stringify(rows[0]));
    } catch (error) {
      res.writeHead(400);
      res.end(JSON.stringify({ error: error.message }));
    }
  }

  
  else if (req.url === "/login" && req.method === "POST") {
    try {
      const body = await json(req);
      const { rows } = await query("SELECT * FROM users WHERE email = $1", [body.email]);
      const user = rows[0];

      if (user && user.password === body.password) {
        res.writeHead(200);
        res.end(JSON.stringify({
          message: "You're successfully logged in",
          user: { id: user.id, username: user.username, email: user.email }
        }));
      } else {
        res.writeHead(401);
        res.end(JSON.stringify({ message: "Username or password is incorrect" }));
      }
    } catch (error) {
      res.writeHead(500);
      res.end(JSON.stringify({ error: error.message }));
    }
  }


  else if (req.url === "/users" && req.method === "PUT") {
    try {
      const body = await json(req);
      const { id, username } = body;

      if (!id || !username) {
        res.writeHead(400);
        res.end(JSON.stringify({ message: "Please provide both 'id' and new 'username'" }));
        return;
      }

     
      const { rows } = await query(
        "UPDATE users SET username = $1 WHERE id = $2 RETURNING id, username, email",
        [username, id]
      );

      if (rows.length === 0) {
        res.writeHead(404);
        res.end(JSON.stringify({ message: "User not found" }));
      } else {
        res.writeHead(200);
        res.end(JSON.stringify({
          message: "Username successfully updated",
          user: rows[0]
        }));
      }
    } catch (error) {
      res.writeHead(500);
      res.end(JSON.stringify({ error: error.message }));
    }
  }


  else if (req.url === "/users" && req.method === "DELETE") {
    try {
      const body = await json(req);
      const { id } = body;

      if (!id) {
        res.writeHead(400);
        res.end(JSON.stringify({ message: "Please provide user 'id' to delete" }));
        return;
      }

 
      const { rows } = await query(
        "DELETE FROM users WHERE id = $1 RETURNING id, username, email",
        [id]
      );

      if (rows.length === 0) {
        res.writeHead(404);
        res.end(JSON.stringify({ message: "User not found" }));
      } else {
        res.writeHead(200);
        res.end(JSON.stringify({
          message: "User successfully deleted",
          deletedUser: rows[0]
        }));
      }
    } catch (error) {
      res.writeHead(500);
      res.end(JSON.stringify({ error: error.message }));
    }
  }

  else {
    res.writeHead(404);
    res.end(JSON.stringify({ message: "This page doesn't exist" }));
  }
});

server.listen(5000, () => {
  console.log("Server successfully running at port 5000");
});