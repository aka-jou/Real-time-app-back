import { WebSocketServer, WebSocket } from 'ws';

const startWebSocketServer = () => {
    const wss = new WebSocketServer({ port: 3000 });
    const clients = new Map(); 

    wss.on('connection', ws => {
        console.log("Cliente conectado");

        ws.send("Por favor, envía tu ID al servidor.");

        ws.on("message", data => {
            const clientId = data.trim(); // obtener el ID del cliente 

            if (clientId) {
               
                if (clients.has(clientId)) {
                    ws.send(`El ID ${clientId} ya está en uso. Por favor, elige otro.`);
                    ws.close();
                } else {
                    clients.set(clientId, ws);
                    console.log(`Cliente conectado con ID: ${clientId}`);

               
                    ws.send(`Conexión exitosa. Tu ID es: ${clientId}`);
                }
            } else {
                ws.send("ID no válido. Por favor, envía un ID válido.");
                ws.close();
            }

            ws.on("close", () => {
                console.log(`Cliente desconectado con ID: ${clientId}`);
                clients.delete(clientId);
            });

            ws.on("message", message => {
                console.log(`Dato recibido del cliente ${clientId}: ${message}`);

                // mensaje a otro cliente por ID
                if (message.startsWith("/send ")) {
                    const [command, targetClientId, message] = message.split(' ', 3);
                    const targetClient = clients.get(targetClientId);
                    if (targetClient && targetClient.readyState === WebSocket.OPEN) {
                        targetClient.send(`Mensaje de ${clientId}: ${message}`);
                    }
                }
            });
        });
    });
};

export default startWebSocketServer;
