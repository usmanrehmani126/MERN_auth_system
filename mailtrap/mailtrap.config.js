

import { MailtrapClient } from "mailtrap";
import dotenv from "dotenv";

dotenv.config();


export const mailClient = new MailtrapClient({
  token: 'b24a5aa5e682ba72de005f3c7d094b86',
});

export const sender = {
  email: "hello@demomailtrap.co",
  name: "Mailtrap Test",  

};
