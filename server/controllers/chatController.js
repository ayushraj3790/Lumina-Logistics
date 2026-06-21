import { GoogleGenerativeAI } from '@google/generative-ai';
import Chat from '../models/Chat.js';

const SYSTEM_PROMPT = `You are Lumina AI, a helpful logistics assistant for Lumina Logistics platform.
Help users track packages, explain delivery statuses (pending, picked_up, in_warehouse, in_transit, out_for_delivery, delivered, delayed),
guide them to book shipments, and answer shipping questions. Keep responses concise and friendly.`;

export const sendMessage = async (req, res) => {
  const { message, chatId } = req.body;
  let chat = chatId ? await Chat.findOne({ _id: chatId, user: req.user._id }) : null;
  if (!chat) {
    chat = await Chat.create({ user: req.user._id, messages: [] });
  }
  chat.messages.push({ role: 'user', content: message });

  let assistantReply = `Thanks for reaching out! For tracking, visit Track page and enter your LUM-XXXXXXXX ID. For booking, go to Dashboard > Book Shipment.`;

  if (process.env.GEMINI_API_KEY) {
    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      
      const history = chat.messages.slice(-10).map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
      }));
      
      const chatSession = model.startChat({
        history: history,
        systemInstruction: SYSTEM_PROMPT,
      });
      
      const result = await chatSession.sendMessage(message);
      assistantReply = result.response.text() || assistantReply;
    } catch (err) {
      console.error('Gemini error:', err.message);
    }
  }

  chat.messages.push({ role: 'assistant', content: assistantReply });
  await chat.save();
  res.json({ success: true, chat, reply: assistantReply });
};

export const getChats = async (req, res) => {
  const chats = await Chat.find({ user: req.user._id }).sort('-updatedAt').limit(10);
  res.json({ success: true, chats });
};

export const getChat = async (req, res) => {
  const chat = await Chat.findOne({ _id: req.params.id, user: req.user._id });
  if (!chat) return res.status(404).json({ success: false, message: 'Not found' });
  res.json({ success: true, chat });
};
