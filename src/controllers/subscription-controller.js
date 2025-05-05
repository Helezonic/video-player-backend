const { Subscription } = require('../models/subscriber-model.js');

const subscribeToChannel = async (req, res) => {
  try {
    const userId = req.userId; // Logged-in user ID from JWT middleware
    const channelId = req.params.id; // Channel ID from request parameters

    // Check if the user is trying to subscribe to their own channel
    if (userId === channelId) {
      return res.status(400).json({ message: "You cannot subscribe to your own channel." });
    }

    // Check if the subscription already exists
    const existingSubscription = await Subscription.findOne({ subscriber: userId, channel: channelId });
    if (existingSubscription) {
      return res.status(200).json({ 
        message: "You are already subscribed to this channel.", 
        isSubscribed: true 
      });
    }

    // Create a new subscription document
    const newSubscription = new Subscription({
      subscriber: userId,
      channel: channelId,
    });

    await newSubscription.save();

    res.status(201).json({ 
      message: "Subscription successful.", 
      isSubscribed: true, 
      subscription: newSubscription 
    });
  } catch (error) {
    console.error("Error subscribing to channel:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

module.exports = { subscribeToChannel };