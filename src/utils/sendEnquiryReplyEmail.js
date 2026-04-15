const nodemailer = require("nodemailer")


// ============ EMAIL TEMPLATE ============
const enquiryReplyTemplate = (userName, blogTitle, adminMessage) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Reply to Your Enquiry</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background-color: #f4f6f9; font-family: 'Inter', Arial, sans-serif; }
  </style>
</head>
<body>
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px; width:100%;">

          <!-- ── Header ── -->
          <tr>
            <td style="
              background: linear-gradient(135deg, #1a1a2e 0%, #16213e 60%, #0f3460 100%);
              padding: 40px 48px;
              border-radius: 16px 16px 0 0;
              text-align: center;
            ">
              <p style="color: rgba(255,255,255,0.5); font-size: 12px; letter-spacing: 3px; text-transform: uppercase; margin-bottom: 12px;">
                The Blog
              </p>
              <h1 style="color: #ffffff; font-size: 26px; font-weight: 700; letter-spacing: -0.5px;">
                We've Replied to Your Enquiry
              </h1>
              <p style="color: rgba(255,255,255,0.6); font-size: 14px; margin-top: 10px;">
                Our team has reviewed your message and responded below.
              </p>
            </td>
          </tr>

          <!-- ── Body ── -->
          <tr>
            <td style="background: #ffffff; padding: 40px 48px;">

              <!-- Greeting -->
              <p style="font-size: 16px; color: #1a1a2e; font-weight: 600; margin-bottom: 8px;">
                Hi ${userName}, 👋
              </p>
              <p style="font-size: 14px; color: #6b7280; line-height: 1.7; margin-bottom: 28px;">
                Thank you for reaching out to us regarding the blog post
                <strong style="color: #0f3460;">"${blogTitle}"</strong>.
                We appreciate you taking the time to send us your enquiry — here's our response:
              </p>

              <!-- Reply Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 28px;">
                <tr>
                  <td style="
                    background: #f8faff;
                    border-left: 4px solid #0f3460;
                    border-radius: 0 12px 12px 0;
                    padding: 20px 24px;
                  ">
                    <p style="font-size: 12px; color: #0f3460; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 10px;">
                      Message from our team
                    </p>
                    <p style="font-size: 15px; color: #374151; line-height: 1.8;">
                      ${adminMessage}
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Divider -->
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin-bottom: 28px;" />

              <!-- CTA -->
              <p style="font-size: 14px; color: #6b7280; line-height: 1.7; margin-bottom: 24px;">
                If you have any further questions or need more clarification, feel free to reply to this email or visit our blog for more helpful content.
              </p>

              <table cellpadding="0" cellspacing="0" style="margin-bottom: 32px;">
                <tr>
                  <td style="
                    background: #0f3460;
                    border-radius: 8px;
                    padding: 12px 28px;
                  ">
                    <a href="#" style="color: #ffffff; font-size: 14px; font-weight: 600; text-decoration: none; letter-spacing: 0.3px;">
                      Visit Our Blog →
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Thank You -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="
                    background: linear-gradient(135deg, #f0f4ff, #faf5ff);
                    border-radius: 12px;
                    padding: 20px 24px;
                    text-align: center;
                  ">
                    <p style="font-size: 20px; margin-bottom: 6px;">🙏</p>
                    <p style="font-size: 15px; font-weight: 700; color: #1a1a2e; margin-bottom: 4px;">
                      Thank You for Being Part of Our Community!
                    </p>
                    <p style="font-size: 13px; color: #6b7280; line-height: 1.6;">
                      Your curiosity and engagement means everything to us.<br/>
                      We hope our content continues to inspire and inform you.
                    </p>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- ── Footer ── -->
          <tr>
            <td style="
              background: #1a1a2e;
              padding: 28px 48px;
              border-radius: 0 0 16px 16px;
              text-align: center;
            ">
              <p style="color: rgba(255,255,255,0.4); font-size: 12px; line-height: 1.7;">
                You received this email because you submitted an enquiry on our blog.<br/>
                If this wasn't you, please ignore this email.
              </p>
              <p style="color: rgba(255,255,255,0.2); font-size: 11px; margin-top: 12px;">
                © ${new Date().getFullYear()} The Blog. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`

// ============ SEND EMAIL FUNCTION ============
const sendEnquiryReplyEmail = async (email, subject, userName, blogTitle, adminMessage) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS,
        },
    })

    const response = await transporter.sendMail({
        from: `"The Blog" <${process.env.MAIL_USER}>`,
        to: email,
        subject: subject,
        html: enquiryReplyTemplate(userName, blogTitle, adminMessage),
    })

    if (!response) return false

    return true
}

module.exports =  sendEnquiryReplyEmail 