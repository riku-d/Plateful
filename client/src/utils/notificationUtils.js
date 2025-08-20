import axios from 'axios';

/**
 * Utility functions for creating notifications for different actions in the application
 */

/**
 * Create a notification when a user comments on a post
 * @param {string} postId - The ID of the post that was commented on
 * @param {string} postTitle - The title of the post
 * @param {string} commentAuthorId - The ID of the user who made the comment
 * @param {string} commentAuthorName - The name of the user who made the comment
 * @param {string} postAuthorId - The ID of the post author to notify
 */
export const createCommentNotification = async (postId, postTitle, commentAuthorId, commentAuthorName, postAuthorId) => {
  // Don't notify if the commenter is the post author
  if (commentAuthorId === postAuthorId) return;
  
  try {
    await axios.post('/api/notifications', {
      user: postAuthorId,
      type: 'comment',
      title: 'New Comment',
      message: `${commentAuthorName} commented on your post: "${postTitle.substring(0, 30)}${postTitle.length > 30 ? '...' : ''}"`,
      relatedTo: {
        model: 'post',
        item: postId
      }
    });
  } catch (error) {
    console.error('Error creating comment notification:', error);
  }
};

/**
 * Create a notification when a user likes a post
 * @param {string} postId - The ID of the post that was liked
 * @param {string} postTitle - The title of the post
 * @param {string} likeAuthorId - The ID of the user who liked the post
 * @param {string} likeAuthorName - The name of the user who liked the post
 * @param {string} postAuthorId - The ID of the post author to notify
 */
export const createLikeNotification = async (postId, postTitle, likeAuthorId, likeAuthorName, postAuthorId) => {
  // Don't notify if the liker is the post author
  if (likeAuthorId === postAuthorId) return;
  
  try {
    await axios.post('/api/notifications', {
      user: postAuthorId,
      type: 'like',
      title: 'New Like',
      message: `${likeAuthorName} liked your post: "${postTitle.substring(0, 30)}${postTitle.length > 30 ? '...' : ''}"`,
      relatedTo: {
        model: 'post',
        item: postId
      }
    });
  } catch (error) {
    console.error('Error creating like notification:', error);
  }
};

/**
 * Create a notification when a donation is created
 * @param {string} donationId - The ID of the donation
 * @param {string} donationTitle - The title of the donation
 * @param {string} donorId - The ID of the donor
 * @param {string} donorName - The name of the donor
 * @param {Array<string>} recipientIds - Array of recipient IDs to notify
 */
export const createDonationNotification = async (donationId, donationTitle, donorId, donorName, recipientIds) => {
  try {
    // Create notifications for all potential recipients
    const notifications = recipientIds.map(recipientId => ({
      user: recipientId,
      type: 'donation',
      title: 'New Donation Available',
      message: `${donorName} has donated: "${donationTitle.substring(0, 30)}${donationTitle.length > 30 ? '...' : ''}"`,
      relatedTo: {
        model: 'donation',
        item: donationId
      }
    }));
    
    // Send all notifications
    await Promise.all(notifications.map(notification => 
      axios.post('/api/notifications', notification)
    ));
  } catch (error) {
    console.error('Error creating donation notifications:', error);
  }
};

/**
 * Create a notification when a donation is reserved
 * @param {string} donationId - The ID of the donation
 * @param {string} donationTitle - The title of the donation
 * @param {string} recipientId - The ID of the recipient who reserved
 * @param {string} recipientName - The name of the recipient
 * @param {string} donorId - The ID of the donor to notify
 */
export const createReservationNotification = async (donationId, donationTitle, recipientId, recipientName, donorId) => {
  try {
    await axios.post('/api/notifications', {
      user: donorId,
      type: 'reservation',
      title: 'Donation Reserved',
      message: `${recipientName} has reserved your donation: "${donationTitle.substring(0, 30)}${donationTitle.length > 30 ? '...' : ''}"`,
      relatedTo: {
        model: 'donation',
        item: donationId
      }
    });
  } catch (error) {
    console.error('Error creating reservation notification:', error);
  }
};

/**
 * Create a notification when a new organization is added
 * @param {string} organizationId - The ID of the organization
 * @param {string} organizationName - The name of the organization
 * @param {string} creatorId - The ID of the user who created the organization
 * @param {string} creatorName - The name of the user who created the organization
 * @param {Array<string>} adminIds - Array of admin IDs to notify
 */
export const createOrganizationNotification = async (organizationId, organizationName, creatorId, creatorName, adminIds) => {
  try {
    // Create notifications for all admins
    const notifications = adminIds.map(adminId => ({
      user: adminId,
      type: 'organization',
      title: 'New Organization Added',
      message: `${creatorName} has added a new organization: "${organizationName}"`,
      relatedTo: {
        model: 'organization',
        item: organizationId
      }
    }));
    
    // Send all notifications
    await Promise.all(notifications.map(notification => 
      axios.post('/api/notifications', notification)
    ));
  } catch (error) {
    console.error('Error creating organization notifications:', error);
  }
};