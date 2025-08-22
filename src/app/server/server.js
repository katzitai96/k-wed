// const express = require("express");
// const bodyParser = require("body-parser");
// const cors = require("cors");
// const axios = require("axios");
// const { createClient } = require("@supabase/supabase-js");
// const path = require("path");

// // Load environment variables - with path to the root directory
// require("dotenv").config({
//   path: path.resolve(__dirname, "../../../.env"),
// });

// // Initialize Express app
// const app = express();
// const port = process.env.PORT || 3000;

// // WhatsApp Cloud API configuration
// const WHATSAPP_API_URL = "https://graph.facebook.com/v18.0";
// const getWhatsAppConfig = () => ({
//   phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
//   accessToken: process.env.WHATSAPP_ACCESS_TOKEN,
//   wabaId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID,
//   webhookVerifyToken: process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN,
// });

// // Debug environment variables
// console.log("Environment variables loaded:");
// console.log("- PORT:", process.env.PORT);
// console.log(
//   "- WHATSAPP_PHONE_NUMBER_ID:",
//   process.env.WHATSAPP_PHONE_NUMBER_ID ? "Found" : "Missing"
// );
// console.log(
//   "- WHATSAPP_ACCESS_TOKEN:",
//   process.env.WHATSAPP_ACCESS_TOKEN ? "Found" : "Missing"
// );
// console.log("- SUPABASE_URL:", process.env.SUPABASE_URL ? "Found" : "Missing");
// console.log(
//   "- SUPABASE_ANON_KEY:",
//   process.env.SUPABASE_ANON_KEY ? "Found" : "Missing"
// );

// // Middleware
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: false }));
// app.use(cors());

// // WhatsApp Cloud API helper functions
// const sendTextMessage = async (to, message) => {
//   const config = getWhatsAppConfig();

//   if (!config.phoneNumberId || !config.accessToken) {
//     throw new Error(
//       "WhatsApp configuration missing: phoneNumberId or accessToken"
//     );
//   }

//   const cleanPhoneNumber = to.replace("whatsapp:", "").replace("+", "");

//   const payload = {
//     messaging_product: "whatsapp",
//     to: cleanPhoneNumber,
//     text: { body: message },
//   };

//   try {
//     const response = await axios.post(
//       `${WHATSAPP_API_URL}/${config.phoneNumberId}/messages`,
//       payload,
//       {
//         headers: {
//           Authorization: `Bearer ${config.accessToken}`,
//           "Content-Type": "application/json",
//         },
//       }
//     );
//     return response.data;
//   } catch (error) {
//     console.error("WhatsApp API Error:", error.response?.data || error.message);
//     throw error;
//   }
// };

// // Initialize Supabase client
// const supabase = createClient(
//   process.env.SUPABASE_URL,
//   process.env.SUPABASE_ANON_KEY
// );

// // Serve static files from Angular app
// app.use(express.static("dist/wedding-rsvp"));

// // API Routes

// // Send single WhatsApp message
// app.post("/api/send-message", async (req, res) => {
//   try {
//     const { to, body } = req.body;

//     // Send message via WhatsApp Cloud API
//     const whatsappResponse = await sendTextMessage(to, body);

//     // Record message in database
//     const { data: messageRecord, error: dbError } = await supabase
//       .from("message_history")
//       .insert([
//         {
//           invitee_id: req.body.inviteeId || null,
//           template_id: req.body.templateId || null,
//           message_body: body,
//           sent_at: new Date(),
//           status: "delivered",
//           whatsapp_message_id: whatsappResponse.messages?.[0]?.id || null,
//         },
//       ])
//       .select();

//     if (dbError) {
//       console.error("Error recording message to database:", dbError);
//     }

//     res.json({
//       success: true,
//       whatsappMessageId: whatsappResponse.messages?.[0]?.id,
//       messageHistoryId: messageRecord?.[0]?.id,
//       whatsappResponse: whatsappResponse,
//     });
//   } catch (error) {
//     console.error("Error sending WhatsApp message:", error);

//     const errorMessage = error.response?.data?.error?.message || error.message;
//     const errorCode = error.response?.data?.error?.code || "UNKNOWN_ERROR";

//     res.status(500).json({
//       success: false,
//       error: errorMessage,
//       errorCode: errorCode,
//       details: error.response?.data || null,
//     });
//   }
// });

// // Send bulk WhatsApp messages
// app.post("/api/send-bulk-messages", async (req, res) => {
//   try {
//     const { messages } = req.body;
//     const results = [];
//     const errors = [];

//     // Send messages one by one to avoid rate limiting
//     for (const msgData of messages) {
//       try {
//         // Send message via WhatsApp Cloud API
//         const whatsappResponse = await sendTextMessage(
//           msgData.to,
//           msgData.body
//         );

//         // Record message in database
//         const { data: messageRecord, error: dbError } = await supabase
//           .from("message_history")
//           .insert([
//             {
//               invitee_id: msgData.inviteeId || null,
//               template_id: msgData.templateId || null,
//               message_body: msgData.body,
//               sent_at: new Date(),
//               status: "sent",
//               whatsapp_message_id: whatsappResponse.messages?.[0]?.id || null,
//             },
//           ])
//           .select();

//         if (dbError) {
//           console.error("Error recording message to database:", dbError);
//         }

//         results.push({
//           to: msgData.to,
//           whatsappMessageId: whatsappResponse.messages?.[0]?.id,
//           messageHistoryId: messageRecord?.[0]?.id,
//         });
//       } catch (error) {
//         errors.push({ to: msgData.to, error: error.message });
//       }

//       // Small delay to avoid rate limiting (WhatsApp Cloud API has rate limits)
//       await new Promise((resolve) => setTimeout(resolve, 1000));
//     }

//     res.json({ success: true, results, errors });
//   } catch (error) {
//     console.error("Error sending bulk messages:", error);
//     res.status(500).json({ success: false, error: error.message });
//   }
// });

// // Schedule a message for later sending
// app.post("/api/schedule-message", async (req, res) => {
//   try {
//     const { to, body, scheduledDate, inviteeId, templateId } = req.body;

//     // Store the scheduled message in the database with a 'scheduled' status
//     const { data, error } = await supabase
//       .from("scheduled_messages")
//       .insert([
//         {
//           to,
//           body,
//           invitee_id: inviteeId || null,
//           template_id: templateId || null,
//           scheduled_date,
//           created_at: new Date(),
//         },
//       ])
//       .select();

//     if (error) {
//       throw error;
//     }

//     res.json({ success: true, scheduledMessageId: data[0].id });
//   } catch (error) {
//     console.error("Error scheduling message:", error);
//     res.status(500).json({ success: false, error: error.message });
//   }
// });

// // Webhook for receiving WhatsApp replies
// app.get("/api/webhook-response", async (req, res) => {
//   // Handle webhook verification (GET request)
//   const mode = req.query["hub.mode"];
//   const token = req.query["hub.verify_token"];
//   const challenge = req.query["hub.challenge"];

//   const config = getWhatsAppConfig();

//   if (mode === "subscribe" && token === config.webhookVerifyToken) {
//     console.log("Webhook verified successfully");
//     return res.status(200).send(challenge);
//   } else {
//     console.error("Webhook verification failed");
//     return res.status(403).send("Forbidden");
//   }
// });

// app.post("/api/webhook-response", async (req, res) => {
//   try {
//     // Log the incoming request for debugging
//     console.log("WhatsApp webhook request received:", {
//       headers: req.headers,
//       body: req.body,
//     });

//     // Validate that we received a proper request
//     if (!req.body) {
//       console.error("Webhook received empty request body");
//       return res.status(400).send("Bad Request: Empty body");
//     }

//     // Parse WhatsApp webhook payload
//     const entry = req.body.entry?.[0];
//     const changes = entry?.changes?.[0];
//     const value = changes?.value;

//     if (!value || !value.messages) {
//       console.log("No message data found in webhook, might be a status update");
//       return res.status(200).send("OK");
//     }

//     const message = value.messages[0];
//     const contact = value.contacts?.[0];

//     const messageData = {
//       messageId: message.id,
//       from: message.from,
//       timestamp: message.timestamp,
//       type: message.type,
//       text: message.text?.body || "",
//       contactName: contact?.profile?.name || "",
//       waId: contact?.wa_id || message.from,
//     };

//     const { from, text: messageText, messageId } = messageData;
//     console.log(`Received WhatsApp message from ${from}: ${messageText}`);

//     // Look up invitee by phone number
//     let formattedPhone = from;

//     const { data: invitees, error: lookupError } = await supabase
//       .from("invitees")
//       .select("*")
//       .eq("phone_number", formattedPhone)
//       .limit(1);

//     if (lookupError) {
//       console.error("Error looking up invitee:", lookupError);
//     }

//     const invitee = invitees?.[0];

//     if (invitee) {
//       // Process RSVP response
//       let rsvpStatus = "pending";

//       const lowercaseText = messageText.toLowerCase();
//       if (
//         lowercaseText.includes("yes") ||
//         lowercaseText.includes("attending") ||
//         lowercaseText.includes("will attend")
//       ) {
//         rsvpStatus = "confirmed";
//       } else if (
//         lowercaseText.includes("no") ||
//         lowercaseText.includes("not attending") ||
//         lowercaseText.includes("cannot attend")
//       ) {
//         rsvpStatus = "declined";
//       } else if (
//         lowercaseText.includes("maybe") ||
//         lowercaseText.includes("possibly")
//       ) {
//         rsvpStatus = "maybe";
//       }

//       if (rsvpStatus !== "pending") {
//         // Update invitee RSVP status
//         const { error: updateError } = await supabase
//           .from("invitees")
//           .update({
//             rsvp_status: rsvpStatus,
//             additional_info: invitee.additional_info
//               ? `${
//                   invitee.additional_info
//                 }\n${new Date().toISOString()}: ${messageText}`
//               : `${new Date().toISOString()}: ${messageText}`,
//             updated_at: new Date(),
//           })
//           .eq("id", invitee.id);

//         if (updateError) {
//           console.error("Error updating invitee RSVP status:", updateError);
//         }
//       }

//       // Record the message response
//       const { error: recordError } = await supabase
//         .from("message_history")
//         .insert([
//           {
//             invitee_id: invitee.id,
//             message_body: messageText,
//             sent_at: new Date(),
//             status: "delivered",
//             response_received: true,
//             response_text: messageText,
//             response_received_at: new Date(),
//             whatsapp_message_id: messageId,
//           },
//         ]);

//       if (recordError) {
//         console.error("Error recording message response:", recordError);
//       }
//     }

//     // For WhatsApp Cloud API, we just need to return 200 OK
//     // No need to send a TwiML response like with Twilio
//     res.status(200).send("OK");
//   } catch (error) {
//     console.error("Error handling WhatsApp webhook:", error);

//     // Log detailed error information
//     console.error({
//       message: error.message,
//       stack: error.stack,
//       requestBody: req.body,
//       requestHeaders: req.headers,
//     });

//     // Make sure we respond even if there's an error
//     if (!res.headersSent) {
//       res.status(500).send("Error processing webhook");
//     }
//   }
// });

// // For any other routes, serve the Angular app
// app.get("*", (req, res) => {
//   res.sendFile("dist/wedding-rsvp/index.html", { root: __dirname });
// });

// // Export the app for Vercel serverless functions
// module.exports = app;

// // Start the server only when running locally (not in Vercel)
// if (require.main === module) {
//   app.listen(port, () => {
//     console.log(`Server listening on port ${port}`);
//   });
// }
