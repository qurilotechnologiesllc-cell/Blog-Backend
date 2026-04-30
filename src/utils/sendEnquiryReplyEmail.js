const SibApiV3Sdk = require("sib-api-v3-sdk");


const defaultClient =
  SibApiV3Sdk.ApiClient.instance;

const apiKey =
  defaultClient.authentications["api-key"];

apiKey.apiKey =
  process.env.BREVO_API_KEY;

const apiInstance =
  new SibApiV3Sdk.TransactionalEmailsApi();


// ============ SEND EMAIL FUNCTION ============
const sendEnquiryReplyEmail = async (email, subject, userName, blogTitle, adminMessage) => {
  try {

    const response =
      await apiInstance.sendTransacEmail({

        sender: {
          email: process.env.BREVO_USER,
          name: "Qurilo Solution",
        },

        to: [
          {
            email: email,
          },
        ],

        templateId: 2,

        subject: subject,

        params: {
          userName,
          blogTitle,
          adminMessage,
          year: new Date().getFullYear(),
        }
      });

    console.log(
      "Email Sent:",
      response
    );
    return response

  } catch (error) {

    console.log(
      error.response?.body ||
      error.message
    );
  }
}

module.exports = sendEnquiryReplyEmail 