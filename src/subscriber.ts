import { saveRawData } from "./mongodb";
import { getMqttClient } from "./mqttClient";

const TOPICO = process.env.MQTT_TOPIC || "estacoes/+/dados";

export function startReceptor(): void {
  const client = getMqttClient();

  function performSubscribe() {
    client.subscribe(TOPICO, { qos: 1 }, (err) => {
      if (err) {
        console.error("[MQTT] Erro ao subscrever tópico:", err.message);
      } else {
        console.log("[MQTT] Subscrito no tópico:", TOPICO);
      }
    });
  }

  if (client.connected) {
    performSubscribe();
  } else {
    client.on("connect", performSubscribe);
  }

  client.on("message", async (topic: string, message: Buffer) => {
    try {
      const rawData = JSON.parse(message.toString());
      console.log(`[MQTT] Mensagem recebida no tópico: ${topic}`);

      await saveRawData({
        topic,
        payload: rawData,
      });
    } catch (error) {
      console.error("[MQTT] Erro ao processar mensagem:", error);
    }
  });
}

// Ponto de entrada
startReceptor();
console.log("[Servidor A] Receptor MQTT iniciado.");
