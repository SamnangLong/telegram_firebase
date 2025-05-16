const { TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");
const input = require("input");
const fs = require("fs");
const db = require("./firebase");

const apiId = 23234280; // 🔁 Your Telegram API ID
const apiHash = "211140680b9d97a3d8b78d0e9b78d94b"; // 🔁 Your Telegram API Hash
const sessionPath = "./session/session.txt";

// Ensure session directory exists
if (!fs.existsSync("./session")) fs.mkdirSync("./session");

const stringSession = new StringSession(
  fs.existsSync(sessionPath) ? fs.readFileSync(sessionPath, "utf8") : ""
);

(async () => {
  const client = new TelegramClient(stringSession, apiId, apiHash, {
    connectionRetries: 5,
  });

  await client.start({
    phoneNumber: async () => await input.text("Enter your phone number: "),
    password: async () =>
      await input.text("Enter your 2FA password (if any): "),
    phoneCode: async () => await input.text("Enter the code you received: "),
    onError: (err) => console.error("❌ Auth error:", err),
  });

  console.log("✅ Logged in successfully!");
  fs.writeFileSync(sessionPath, client.session.save());

  const targetChat = "-1002348089375"; // your group/channel ID

  try {
    const entity = await client.getEntity(targetChat);
    console.log("🔄 Monitoring messages from:", targetChat);

    let lastMessageId = 0;

    setInterval(async () => {
      try {
        const messages = await client.getMessages(entity, { limit: 1 });

        for (const msg of messages.reverse()) {
          if (!msg.message) continue;

          if (msg.id > lastMessageId) {
            lastMessageId = msg.id;

            const data = {
              text: msg.message,
              //   date: msg.date.toISOString(),
            };

            console.log("⬆️ New message:", data.text);
            await db.ref("telegram_messages").set(data);
          }
        }
      } catch (error) {
        console.error("⛔ Error in polling loop:", error);
      }
    }, 1000); // poll every 30 seconds(30000)
  } catch (error) {
    console.error("❌ Error fetching/sending messages:", error);
  }
})();
