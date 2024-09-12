package server

import (
	"encoding/json"
	"fmt"
	"log"
	"net"
	"net/http"

	"github.com/gorilla/websocket"
	"github.com/grandcat/zeroconf"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

type ClickType string

const (
	ClickTypeLeft   ClickType = "left"
	ClickTypeRight  ClickType = "right"
	ClickTypeMiddle ClickType = "middle"
)

type MouseEvent struct {
	Dx        float64    `json: "dx"`
	Dy        float64    `json: "dy"`
	ClickType *ClickType `json: "clickType,omitempty"`
}

func handleWebSocketConn(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)

	if err != nil {
		log.Fatal("Error createing a websocket: ", err.Error())
	}

	defer conn.Close()

	_, message, err := conn.ReadMessage()

	if err != nil {
		log.Fatal("Error reading the message: ", err.Error())
	}
	var messageMouse MouseEvent
	err = json.Unmarshal(message, &messageMouse)

	if err != nil {
		log.Fatal("Error parsing the json: ", err.Error())
	}

	log.Println(messageMouse)

}

func getPreferredIP() (string, error) {

	addrs, err := net.InterfaceAddrs()
	if err != nil {
		return "", err
	}
	for _, addr := range addrs {

		ipNet, ok := addr.(*net.IPNet)
		if !ok || ipNet.IP.IsLoopback() {

			continue
		}

		ip := ipNet.IP.To4()
		if ip == nil {
			continue
		}

		return ip.String(), nil
	}
	return "", fmt.Errorf("no valid IP address found")
}

func advertiseService() {
	server, err := zeroconf.Register(
		"ClickerFly",
		"_http._tcp",
		"local.",
		8080,
		[]string{"txt=ClickerFly"},
		nil,
	)
	if err != nil {
		log.Fatal("Error advertising the service: ", err.Error())
	}
	log.Println("The service is now visible")

	defer server.Shutdown()
	select {}
}

func startWebSocket() {

	http.HandleFunc("/ws", handleWebSocketConn)

	localIp, err := getPreferredIP()

	if err != nil {
		log.Fatal("Error getting the ip address: ", err.Error())
	}

	log.Printf("WebSocket server started at %s:8080", localIp)
	log.Fatal(http.ListenAndServe(fmt.Sprintf("%s:8080", localIp), nil))

}

func StartServer() {
	go startWebSocket()
	advertiseService()
}
