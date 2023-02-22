import 'dotenv/config';
const nodemailer = require("nodemailer");

let sendEmail = async (data) => {
    console.log(process.env.EMAIL_APP, process.env.EMAIL_APP_PASSWORD)
    let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false, 
        auth: {
            user: process.env.EMAIL_APP, // generated ethereal user
            pass: process.env.EMAIL_APP_PASSWORD, // generated ethereal password
        },
    });
    console.log(data.receiverEmail, data.newPassword)
    // send mail with defined transport object
    let info = await transporter.sendMail({
        from: `"Fred Foo 👻" <thang.trong.lu.ngu@gmail.com>`, // sender address
        to: data.receiverEmail, // list of receivers
        subject: "Hello ✔", // Subject line
        html: `<span>Mật khẩu mới của bạn là ${data.newPassword}</span>`, // html body
    });
}

export default {
    sendEmail,
}