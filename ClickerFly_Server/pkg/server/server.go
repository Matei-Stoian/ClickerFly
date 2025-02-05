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

	// Accumulators for smooth movement
	var accumX, accumY float64
	const sensitivity = 0.15 // Adjust this value to control mouse speed

	for {
		_, p, err := conn.ReadMessage()
		if err != nil {
			log.Println("Error reading message:", err)
			return
		}

		var mouseEvent MouseEvent
		if err := json.Unmarshal(p, &mouseEvent); err != nil {
			log.Println("Error parsing json:", err)
			continue
		}

		// Accumulate deltas with sensitivity adjustment
		accumX += mouseEvent.Dx * sensitivity
		accumY += mouseEvent.Dy * sensitivity

		// Convert accumulated values to integer movement
		dx := int(accumX)
		dy := int(accumY)

		// Only move if we have at least 1 pixel to move
		if dx != 0 || dy != 0 {
			robotgo.MoveRelative(dx, dy)

			// Preserve fractional movement for next update
			accumX -= float64(dx)
			accumY -= float64(dy)
		}

		// Handle click events
		if mouseEvent.ClickType != nil {
			switch *mouseEvent.ClickType {
			case ClickTypeLeft:
				robotgo.Click("left")
			case ClickTypeRight:
				robotgo.Click("right")
			case ClickTypeMiddle:
				robotgo.Click("middle")
			}
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
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("WebSocket server running. Connect to ws://" + getPreferredIP() + ":8080/ws"))
	})
	http.HandleFunc("/ws", handleWebSocketConn)

	localIp := getPreferredIP()
	qr, err := qrcode.New(localIp, qrcode.Medium)
	if err != nil {
		log.Fatal("Error creating a QR code:", err)
	}

	fmt.Println(qr.ToSmallString(false))
	log.Printf("WebSocket server started at ws://%s:8080", localIp)
	log.Println("To close the application press Ctrl+C")
	if err := http.ListenAndServe(fmt.Sprintf("%s:8080", localIp), nil); err != nil {
		log.Println("ListenAndServe error:", err)
	}
}

func StartServer() {
	go startWebSocket()
	select {} // Keep the main function running
}
