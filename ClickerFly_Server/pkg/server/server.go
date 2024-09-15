package server

import (
	"encoding/json"
	"fmt"
	"log"
	"net"
	"net/http"

	"github.com/go-vgo/robotgo"
	"github.com/gorilla/websocket"
	qrcode "github.com/skip2/go-qrcode"
)

type ClickType string

var currentX, currentY float64

const (
	ClickTypeLeft   ClickType = "left"
	ClickTypeRight  ClickType = "right"
	ClickTypeMiddle ClickType = "middle"
)

type MouseEvent struct {
	Dx        float64    `json:"dx"`
	Dy        float64    `json:"dy"`
	ClickType *ClickType `json:"clickType,omitempty"`
}

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

func handleWebSocketConn(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("Error creating the websocket:", err)
		return
	}
	defer conn.Close()

	log.Println("Client connected")

	for {
		_, p, err := conn.ReadMessage()
		if err != nil {
			log.Println("Error reading message:", err)
			return // Close the connection if there's an error reading the message
		}

		var mouseevent MouseEvent
		err = json.Unmarshal(p, &mouseevent)
		if err != nil {
			log.Println("Error parsing json:", err)
			continue // Skip the rest of the loop for this message if JSON parsing fails
		}
		handleMouse(&mouseevent)
	}
}

func handleMouse(event *MouseEvent) {

	// Move the mouse to the new position

	robotgo.MoveRelative(int(event.Dx*0.75), int(event.Dy*0.75))

	// Check if there's a click action
	if event.ClickType != nil {
		switch *event.ClickType {
		case ClickTypeLeft:
			robotgo.Click("left")
		case ClickTypeRight:
			robotgo.Click("right")
		case ClickTypeMiddle:
			robotgo.Click("middle")
		}
	}

}

func printMouseEvent(event MouseEvent) {
	clickTypeStr := "nil"
	if event.ClickType != nil {
		clickTypeStr = string(*event.ClickType)
	}
	fmt.Printf("Received: { Dx: %.2f, Dy: %.2f, ClickType: %s }\n", event.Dx, event.Dy, clickTypeStr)
}

func getPreferredIP() string {
	conn, err := net.Dial("udp", "8.8.8.8:80")
	if err != nil {
		log.Fatal(err)
	}
	defer conn.Close()

	localAddr := conn.LocalAddr().(*net.UDPAddr)
	return localAddr.IP.String()
}

func printQRCodeInTerminal(qr *qrcode.QRCode) {
	size := qr.Bitmap()

	for y := 0; y < len(size); y += 2 { // Increase step to shrink height
		for x := 0; x < len(size[y]); x++ {
			if size[y][x] {
				fmt.Print("█")
			} else {
				fmt.Print(" ")
			}
		}
		fmt.Println()
	}
}

func startWebSocket() {
	http.HandleFunc("/ws", handleWebSocketConn)

	localIp := getPreferredIP()
	qr, err := qrcode.New(localIp, qrcode.Medium)
	if err != nil {
		log.Fatal("Error creating a QR code:", err)
	}

	fmt.Println(qr.ToSmallString(false))
	log.Printf("WebSocket server started at http://%s:8080", localIp)
	log.Println("To close the application press Ctrl+C")
	if err := http.ListenAndServe(fmt.Sprintf("%s:8080", localIp), nil); err != nil {
		log.Println("ListenAndServe error:", err)
	}
}

func StartServer() {
	go startWebSocket()
	select {} // Keep the main function running
}
