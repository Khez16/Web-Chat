package com.example.webchatserver;
import jakarta.websocket.*;
import jakarta.websocket.server.PathParam;
import jakarta.websocket.server.ServerEndpoint;
import org.json.JSONObject;
import com.fasterxml.jackson.core.io.JsonEOFException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.io.IOException;

// BACKEND JAVA
// Mostly looking back at the WebSocketHelloWorld file(s)

// EDITOR'S NOTE: There's an error with the input for username on the website. This was working previously but now it just doesn't
// Don't know if it's the .JS or .java.

/**
 * This class represents a web socket server, a new connection is created and it receives a roomID as a parameter
 * **/
@ServerEndpoint(value="/ws/{roomID}")
public class ChatServer {

    // contains a static List of ChatRoom used to control the existing rooms and their users

    private static Map<String, ChatRoom> Rooms = new HashMap<>(); // Creating a rooms Map
    private Map<String, String> users = new HashMap<String, String>(); // Map for users

    // you may add other attributes as you see fit

    // For whenever the user opens
    @OnOpen
    public void open(@PathParam("roomID") String roomId, Session session) throws IOException, EncodeException {
        if (!Rooms.containsKey(roomId)) {
            session.getBasicRemote().sendText("{\"type\": \"chat\", \"message\":\"(Server): Room does not exist. Please create a new room or join an existing one.\"}");
            return;
        }

        ChatRoom room = Rooms.get(roomId);
        room.setUserName(session.getId(), ""); // Add the user to the room with an empty username for now

        // Ask the user to enter a name
        session.getBasicRemote().sendText("{\"type\": \"chat\", \"message\":\"(Server): Please state your username.\"}");
    }


    // For whenever the user exits
    @OnClose
    public void close(Session session) throws IOException, EncodeException {
        String userId = session.getId();
        if (users.containsKey(userId)) {
            String username = users.get(userId);
            users.remove(userId); // remove user
            // announce to everybody in the room that a user has left
            for (Session peer : session.getOpenSessions()){
                peer.getBasicRemote().sendText("{\"type\": \"chat\", \"message\":\"(Server): " + username + " left the chat room.\"}");
            }
        }
    }

    // This is for printing messages + new user joining message
    @OnMessage
    public void handleMessage(String comm, Session session) throws IOException, EncodeException {
        // variables for json, type, message, and userID
        String userId = session.getId();
        JSONObject jsonmsg = new JSONObject(comm);
        String type = (String) jsonmsg.get("type");
        String msg = (String) jsonmsg.get("msg");

        // User typing the message:
        if(users.containsKey(userId)){
            // get user's name
            String username = users.get(userId);

            // print out their message that they typed
            for(Session peer: session.getOpenSessions()){
                peer.getBasicRemote().sendText("{\"type\": \"chat\", \"message\":\"(" + username + "): " + msg+"\"}");
            }
        }

        // This is for when the user first joins the chat room.

        else{
            users.put(userId, msg); // user message
            session.getBasicRemote().sendText("{\"type\": \"chat\", \"message\":\"(Server): Welcome to the Room, " + msg + "!\"}"); // this will greet the user

            // Announce to everybody that the user has joined
            for(Session peer: session.getOpenSessions()){
                if(!peer.getId().equals(userId)){
                    peer.getBasicRemote().sendText("{\"type\": \"chat\", \"message\":\"(Server): " + msg + " joined the chat room.\"}");
                }
            }
        }
    }

    // method for adding room
    public static void addRoom(String roomId) {
        if (!Rooms.containsKey(roomId)) {
            Rooms.put(roomId, new ChatRoom(roomId, ""));
        }
    }

}