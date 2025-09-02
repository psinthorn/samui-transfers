import nodemailer from 'nodemailer';
// import mysql from 'mysql2/promise';
//import { EmailOptions } from '../../types';
//import htmlPdf from 'html-pdf';

export default async (req, res) => {
  if (req.method === 'POST') {
    const { requestNumber, firstName, lastName, email, mobile, flightNo, date, carType, carModel, rate, pickupPoint, dropoffPoint, cardNumber, expiryDate, cvv, recaptchaToken } = req.body;

    // Create a transporter object using Mailtrap
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_SSL_HOST,
      port: process.env.SMTP_PORT,
      // secure: false, // true for 465, false for other ports
      // port: parseInt(process.env.MAILTRAP_PORT, 10),
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Company/contact info from env with safe fallbacks
    const COMPANY = {
      name: process.env.COMPANY_NAME || "Samui Transfers",
      bookingEmail: process.env.BOOKING_EMAIL || "booking@samui-transfers.com",
      supportEmail: process.env.SUPPORT_EMAIL || "info@samui-transfers.com",
      phone: process.env.SUPPORT_PHONE || "(+66) 99 108 7999",
      whatsapp: (process.env.SUPPORT_WHATSAPP || "66991087999").replace(/[^\d]/g, ""),
      address: process.env.COMPANY_ADDRESS || "9/38 Moo 6, Bo Phut, Ko Samui, Surat Thani 84320, Thailand",
      facebook: process.env.COMPANY_FACEBOOK || "https://www.facebook.com/profile.php?id=61578880422159",
      website: process.env.COMPANY_WEBSITE || "https://samui-transfers.com",

      // Managed-by details (new)
      managedByName: process.env.MANAGED_BY_NAME || "Samui Transfers Management",
      managedByTaxId: process.env.MANAGED_BY_TAX_ID || "0845560003240",
      managedByWebsite: process.env.MANAGED_BY_WEBSITE || "https://www.f2.co.th",
      managedByEmail: process.env.MANAGED_BY_EMAIL || "info@f2.co.th",
      managedByPhone: process.env.MANAGED_BY_PHONE || "+66 064 027 0528",
    }
    const PRIMARY = "#2563eb" // Tailwind primary

    // Build “Managed by …” footer line once (reused in both emails)
    const managedByHtml =
      COMPANY.managedByName
        ? `
      <p style="margin:0 0 6px 0;color:#64748b;font-size:12px">
        Managed by ${
          COMPANY.managedByWebsite
            ? `<a href="${COMPANY.managedByWebsite}" style="color:${PRIMARY};text-decoration:none">${COMPANY.managedByName}</a>`
            : COMPANY.managedByName
        }${
          COMPANY.managedByTaxId ? ` • Tax ID: ${COMPANY.managedByTaxId}` : ""
        }${
          COMPANY.managedByPhone ? ` • Tel: ${COMPANY.managedByPhone}` : ""
        }${
          COMPANY.managedByEmail
            ? ` • Email: <a href="mailto:${COMPANY.managedByEmail}" style="color:${PRIMARY};text-decoration:none">${COMPANY.managedByEmail}</a>`
            : ""
        }
      </p>`
        : ""

    // Admin email — subject, body, footer
    const adminSubject = `New transfer request — ${requestNumber || "-"}`

    const adminHtml = `
      <div style="font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#0f172a;background:#ffffff;padding:24px">
        <div style="max-width:640px;margin:0 auto">
          <h1 style="margin:0 0 8px 0;font-size:20px;color:#0f172a">New Transfer Request</h1>
          <p style="margin:0 0 16px 0;color:#475569;font-size:14px">A customer submitted a new transfer. Details below.</p>

          <h3 style="margin:16px 0 8px 0;font-size:16px;color:#0f172a">Customer</h3>
          <table style="width:100%;font-size:14px;color:#0f172a">
            <tr><td style="padding:4px 0;color:#475569">Name</td><td style="text-align:right">${firstName} ${lastName}</td></tr>
            <tr><td style="padding:4px 0;color:#475569">Email</td><td style="text-align:right">${email}</td></tr>
            <tr><td style="padding:4px 0;color:#475569">Mobile</td><td style="text-align:right">${mobile}</td></tr>
            <tr><td style="padding:4px 0;color:#475569">Flight no.</td><td style="text-align:right">${flightNo || "-"}</td></tr>
          </table>

          <h3 style="margin:16px 0 8px 0;font-size:16px;color:#0f172a">Booking</h3>
          <table style="width:100%;font-size:14px;color:#0f172a">
            <tr><td style="padding:4px 0;color:#475569">Booking ID</td><td style="text-align:right">${requestNumber || "-"}</td></tr>
            <tr><td style="padding:4px 0;color:#475569">Pickup</td><td style="text-align:right">${pickupPoint}</td></tr>
            <tr><td style="padding:4px 0;color:#475569">Drop‑off</td><td style="text-align:right">${dropoffPoint}</td></tr>
            <tr><td style="padding:4px 0;color:#475569">Date/Time</td><td style="text-align:right">${date}</td></tr>
            <tr><td style="padding:4px 0;color:#475569">Vehicle</td><td style="text-align:right">${[carType, carModel].filter(Boolean).join(" — ") || "-"}</td></tr>
            <tr><td style="padding:4px 0;color:#475569">Rate</td><td style="text-align:right">${rate || "-"}</td></tr>
          </table>

          <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0"/>

          <p style="margin:0;color:#64748b;font-size:12px">
            ${COMPANY.name} • ${COMPANY.address} • ${COMPANY.phone} • <a href="mailto:${COMPANY.bookingEmail}" style="color:${PRIMARY};text-decoration:none">${COMPANY.bookingEmail}</a>
          </p>
          ${managedByHtml}
        </div>
      </div>
    `

    // Customer email — subject, body, footer
    const customerSubject = "Thanks — we’ll confirm your transfer soon"

    const customerHtml = `
      <div style="font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#0f172a;background:#ffffff;padding:24px">
        <div style="max-width:640px;margin:0 auto">
          <!-- Preheader -->
          <div style="display:none;visibility:hidden;opacity:0;height:0;width:0;overflow:hidden">
            We’re reviewing availability and will reply shortly. Booking ID: ${requestNumber || "-"}.
          </div>

          <h1 style="margin:0 0 8px 0;font-size:20px;color:#0f172a">${COMPANY.name}</h1>
          <p style="margin:0 0 16px 0;color:#475569;font-size:14px">
            We’re reviewing availability. Summary below:
          </p>

          <table style="width:100%;font-size:14px;color:#0f172a">
            <tr><td style="padding:4px 0;color:#475569">Booking ID</td><td style="text-align:right">${requestNumber || "-"}</td></tr>
            <tr><td style="padding:4px 0;color:#475569">Name</td><td style="text-align:right">${firstName} ${lastName}</td></tr>
            <tr><td style="padding:4px 0;color:#475569">Email</td><td style="text-align:right">${email}</td></tr>
            <tr><td style="padding:4px 0;color:#475569">Mobile</td><td style="text-align:right">${mobile}</td></tr>
            <tr><td style="padding:4px 0;color:#475569">Flight no.</td><td style="text-align:right">${flightNo || "-"}</td></tr>
            <tr><td style="padding:4px 0;color:#475569">Pickup</td><td style="text-align:right">${pickupPoint}</td></tr>
            <tr><td style="padding:4px 0;color:#475569">Drop‑off</td><td style="text-align:right">${dropoffPoint}</td></tr>
            <tr><td style="padding:4px 0;color:#475569">Date/Time</td><td style="text-align:right">${date}</td></tr>
            <tr><td style="padding:4px 0;color:#475569">Vehicle</td><td style="text-align:right">${[carType, carModel].filter(Boolean).join(" — ") || "-"}</td></tr>
            <tr><td style="padding:4px 0;color:#475569">Rate</td><td style="text-align:right">${rate || "-"}</td></tr>
          </table>

          <div style="margin-top:16px;padding:12px;border:1px solid #e2e8f0;border-radius:8px;background:#f8fafc;color:#334155;font-size:13px">
            This is not a confirmation. We’ll contact you shortly to confirm availability and driver details.
          </div>

          <div style="margin-top:16px;display:flex;gap:8px;flex-wrap:wrap">
            <a
              href="https://wa.me/${COMPANY.whatsapp}"
              style="display:inline-block;background:${PRIMARY};color:#fff;text-decoration:none;border-radius:8px;padding:10px 14px;font-size:14px;margin:0 8px 8px 0"
            >Chat on WhatsApp</a>
            <a
              href="mailto:${COMPANY.supportEmail}"
              style="display:inline-block;background:#0ea5e9;color:#fff;text-decoration:none;border-radius:8px;padding:10px 14px;font-size:14px;margin:0 8px 8px 0"
            >Email support</a>
            <a
              href="${COMPANY.website}"
              style="display:inline-block;background:#334155;color:#fff;text-decoration:none;border-radius:8px;padding:10px 14px;font-size:14px;margin:0 0 8px 0"
            >Visit website</a>
          </div>

          <p style="margin:16px 0 0 0;color:#475569;font-size:13px">
            If a deposit is required, we’ll send secure payment instructions after confirmation.
          </p>

          <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0"/>

          <p style="margin:0 0 6px 0;color:#64748b;font-size:12px">
            ${COMPANY.name} • ${COMPANY.address}
          </p>
          <p style="margin:0 0 6px 0;color:#64748b;font-size:12px">
            Tel: ${COMPANY.phone} • Email: <a href="mailto:${COMPANY.supportEmail}" style="color:${PRIMARY};text-decoration:none">${COMPANY.supportEmail}</a> • WhatsApp: <a href="https://wa.me/${COMPANY.whatsapp}" style="color:${PRIMARY};text-decoration:none">+${COMPANY.whatsapp}</a>
          </p>
          ${managedByHtml}
          <p style="margin:0;color:#94a3b8;font-size:11px">
            This is an automated message. If you didn’t request this, please ignore it.
          </p>
        </div>
      </div>
    `

    // Replace your existing mail options with these:
    const adminMailOptions = {
      from: `"${COMPANY.name} — Requests" <${COMPANY.bookingEmail}>`,
      to: COMPANY.bookingEmail,
      subject: adminSubject,
      html: adminHtml,
    }

    const customerMailOptions = {
      from: `"${COMPANY.name}" <${COMPANY.bookingEmail}>`,
      to: email,
      subject: customerSubject,
      html: customerHtml,
    }

    // // Generate PDF voucher
    // const voucherHtml = `
    //   <h1>Booking Voucher</h1>
    //   <p><strong>First Name:</strong> ${firstName}</p>
    //   <p><strong>Last Name:</strong> ${lastName}</p>
    //   <p><strong>Email:</strong> ${email}</p>
    //   <p><strong>Mobile:</strong> ${mobile}</p>
    //   <p><strong>Flight No:</strong> ${flightNo}</p>
    //   <p><strong>Arrival Time:</strong> ${arrivalTime}</p>
    //   <p><strong>Car Type:</strong> ${carType}</p>
    //   <p><strong>Rate:</strong> ${rate}</p>
    //   <p><strong>Pickup Point:</strong> ${pickupPoint}</p>
    //   <p><strong>Dropoff Point:</strong> ${dropoffPoint}</p>
    // `;

    // htmlPdf.create(voucherHtml).toBuffer(async (err, buffer) => {
    //   if (err) {
    //     console.error('Error generating PDF:', err);
    //     res.status(500).json({ message: 'Failed to generate PDF.' });
    //     return;
    //   }

    //   // Attach PDF voucher to customer email
    //   customerMailOptions.attachments = [
    //     {
    //       filename: 'voucher.pdf',
    //       content: buffer,
    //     },
    //   ];

      try {
        // Send email to the administrator
        await transporter.sendMail(adminMailOptions);
        // Send acknowledgment email to the customer with PDF voucher
        await transporter.sendMail(customerMailOptions);
        // Success message
        res.status(200).json({ message: 'Messages sent successfully!' });
      } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ message: 'Failed to send messages.' });
      }
    // });
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
};