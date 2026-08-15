// ইসলাম বিডি ৩৬০ বট — Broadcast বট
// কাজ: শুধু ADMIN_ID থেকে পাঠানো মেসেজ CHANNEL_ID তে ফরওয়ার্ড/পোস্ট করে

const TelegramBot = require("node-telegram-bot-api");

const BOT_TOKEN = process.env.BOT_TOKEN;
const ADMIN_ID = process.env.ADMIN_ID; // আপনার নিজের টেলিগ্রাম ইউজার আইডি (সংখ্যা)
const CHANNEL_ID = process.env.CHANNEL_ID; // @your_channel_username অথবা -100xxxxxxxxxx

if (!BOT_TOKEN || !ADMIN_ID || !CHANNEL_ID) {
  console.error("BOT_TOKEN, ADMIN_ID, CHANNEL_ID — এই তিনটি Environment Variable সেট করা আবশ্যক।");
  process.exit(1);
}

const bot = new TelegramBot(BOT_TOKEN, { polling: true });

console.log("বট চালু হয়েছে...");

// ===== যেকোনো ব্যবহারকারী /start দিলে স্বাগত বার্তা =====
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  if (String(chatId) === String(ADMIN_ID)) {
    bot.sendMessage(
      chatId,
      "আসসালামু আলাইকুম! আপনি এডমিন হিসেবে লগইন আছেন।\n\n" +
      "আমাকে যেকোনো টেক্সট, ছবি, লিংক বা ফাইল পাঠান — আমি সেটা সাথে সাথে চ্যানেলে পোস্ট করে দেব।\n\n" +
      "কমান্ডসমূহ:\n" +
      "/status — বট ঠিকমতো চলছে কিনা চেক করুন"
    );
  } else {
    bot.sendMessage(
      chatId,
      "আসসালামু আলাইকুম!\n\nইসলামিক কুইজ, নতুন পোস্ট ও প্রতিযোগিতার সব আপডেট পেতে আমাদের চ্যানেলে জয়েন করুন:\n" +
      "👉 https://t.me/" + (CHANNEL_ID.startsWith("@") ? CHANNEL_ID.slice(1) : "your_channel")
    );
  }
});

bot.onText(/\/status/, (msg) => {
  if (String(msg.chat.id) === String(ADMIN_ID)) {
    bot.sendMessage(msg.chat.id, "✅ বট সচল আছে এবং চ্যানেলে পোস্ট করার জন্য প্রস্তুত।");
  }
});

// ===== এডমিনের যেকোনো মেসেজ চ্যানেলে ফরওয়ার্ড/কপি করা =====
bot.on("message", async (msg) => {
  const chatId = msg.chat.id;

  // শুধু এডমিনের প্রাইভেট মেসেজ প্রসেস করব, আর কমান্ড বাদে
  if (String(chatId) !== String(ADMIN_ID)) return;
  if (msg.text && msg.text.startsWith("/")) return; // কমান্ড হলে স্কিপ

  try {
    // copyMessage ব্যবহার করলে "Forwarded from" ট্যাগ ছাড়াই সরাসরি চ্যানেলে পোস্ট হয়
    await bot.copyMessage(CHANNEL_ID, chatId, msg.message_id);
    await bot.sendMessage(chatId, "✅ চ্যানেলে পোস্ট হয়ে গেছে।");
  } catch (err) {
    console.error("পোস্ট করতে সমস্যা:", err.message);
    await bot.sendMessage(
      chatId,
      "❌ পোস্ট করতে সমস্যা হয়েছে। নিশ্চিত করুন বটকে চ্যানেলে Admin হিসেবে যোগ করা হয়েছে এবং CHANNEL_ID সঠিক আছে।\n\nবিস্তারিত: " + err.message
    );
  }
});

bot.on("polling_error", (err) => {
  console.error("Polling error:", err.message);
});
