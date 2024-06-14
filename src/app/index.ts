import axios from "axios";
import nodemailer from "nodemailer";
import { MessageSendReq, MessageSendReqType } from "./schema";
import { FastifyInstance } from "fastify";

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST!,
  port: parseInt(process.env.MAIL_PORT!),
  secure: process.env.MAIL_SECURE! == "true",
  auth: {
    user: process.env.MAIL_USERNAME!,
    pass: process.env.MAIL_PASSWORD!
  }
});

async function routes (fastify: FastifyInstance) {
    fastify.get('/ping', async (request, reply) => {
      return { message: 'pong' }
    });
    fastify.post<{ Body: MessageSendReqType }>('/contact', {
      schema: {
        body: MessageSendReq
      }
    }, async (request, reply) => {
      const recaptcha = await axios.get(`https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET}&response=${request.body.token}`);
      const response = recaptcha.data as { success: boolean };
      if (!response.success) return reply.status(401).send({
        message: "invalid token"
      });
      const info = await transporter.sendMail({
        from: `${request.body.name} ${process.env.MAIL_FROM_ADDRESS!}`,
        to: process.env.MAIL_TO_ADDRESS!,
        replyTo: request.body.email,
        subject: "Contact Form Submission",
        text: `${request.body.name} (${request.body.email}) said:\n${request.body.message}`,
      })
      if (info.rejected.length > 0) return reply.status(500).send({
        message: "Message was rejected"
      })
      return { message: "Email sent successfully" }
    })
  }
  
  export default routes;