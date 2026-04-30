const SibApiV3Sdk = require("sib-api-v3-sdk");

const defaultClient =
    SibApiV3Sdk.ApiClient.instance;

const apiKey =
    defaultClient.authentications["api-key"];

apiKey.apiKey =
    process.env.BREVO_API_KEY;

const apiInstance =
    new SibApiV3Sdk.TransactionalEmailsApi();

const sendOTPEmail = async (
    email,
    otp
) => {

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

                templateId: 1,

                params: {
                    otp: otp,
                },
            });

        console.log(
            "Email Sent:",
            response
        );

    } catch (error) {

        console.log(
            error.response?.body ||
            error.message
        );
    }
};

module.exports = sendOTPEmail;