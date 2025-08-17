import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Helper: Scrape headings and paragraphs from target website
async function scrapeWebsite(url) {
  try {
    const res = await fetch(url);
    const html = await res.text();
    const $ = cheerio.load(html);

    // Example: Collect headings and first few paragraphs
    const headings = [];
    $("h1, h2, h3").each((i, el) => headings.push($(el).text().trim()));
    const paragraphs = [];
    $("p").each((i, el) => {
      if (i < 5) paragraphs.push($(el).text().trim());
    });

    return { headings, paragraphs };
  } catch (err) {
    return { headings: [], paragraphs: [] };
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { message, agent } = req.body;

  // Scrape data from your target website
  const scraped = await scrapeWebsite("http://localhost:3000/about-us");
   console.log("Scraped Data:", scraped);

  // You can route to different agents by prompt engineering
  let systemPrompt = "You are a helpful assistant.";
  if (agent === "booking") systemPrompt = "You are a booking agent for a transfer service. your name is B . You are friendly, kindness, helpful and sale professional. and you are a female";
  if (agent === "support") systemPrompt = "You are a support agent for a transfer service. Your name is B . You are friendly and helpful. and you are a male";

// Add scraped data to system prompt for context
//   const context = `
//     Website Headings: ${scraped.headings.join(" | ")}
//     Key Info: ${scraped.paragraphs.join(" | ")}
//   `;

const context = `
# Welcome to Samui Transfers #
Welcome to Samui-Transfers.com, your trusted local transfer service based right here on the beautiful island of Koh Samui, Thailand. As a locally owned and operated company, we specialize in providing safe, reliable, and comfortable transportation for travelers, families, and groups across the island. Whether you're arriving at the airport, heading to your resort, or exploring the island’s stunning beaches and attractions, our fleet of well-maintained minivans and SUVs is ready to get you there on time—with a smile. At Samui Transfers, we pride ourselves on local knowledge, personalized service, and a deep commitment to making your travel experience smooth and stress-free. Our professional drivers are friendly, punctual, and familiar with every corner of the island, ensuring a seamless journey from pickup to drop-off. Let us take the wheel while you sit back, relax, and enjoy the ride on paradise island.
All the service is managed by our local team, so you can expect the best service and support during your trip.
Managed by F2 Co.,Ltd.

# Our Mission #
At Samui Transfers, our mission is to make your journey as smooth and stress-free as possible. We understand that travel can be hectic, which is why we offer reliable and efficient transfer services tailored to your needs. Our team of experienced drivers is committed to ensuring your safety and comfort while you explore the breathtaking beauty of Koh Samui.

# Service Rate #
- Start from 350 THB
- After 5 km calculate base on distance
- Free cancellation up to 24 hours before your transfer
- No hidden fees, no extra charges
- 24/7 customer support

# Frequently Asked Questions (FAQs) #

## Booking & Payment ##
Q: How do I book an airport transfer?
A: You can book directly through our website, call us, or send a message via WhatsApp or Line.

Q: What payment methods do you accept?
A: We accept cash, credit/debit cards, PayPal, and bank transfers.

Q: Can I modify or cancel my booking?
A: Yes, modifications are allowed up to 24 hours before your transfer. Cancellations may be subject to a fee.

Q: Do I need to book in advance?
A: We recommend booking at least 24 hours in advance to guarantee availability.

## Airport Pick-up & Drop-off ##
Q: Where will I meet my driver at the airport?
A: Your driver will be waiting at the arrivals area with a sign displaying your name.

Q: What happens if my flight is delayed?
A: We track flight schedules, so your driver will adjust the pickup time accordingly.

Q: Can I book a transfer from my hotel to the airport?
A: Yes, we provide one-way and round-trip services.

## Vehicles & Services ##
Q: What types of vehicles do you offer?
A: We offer private cars, minivan, and SUV.

Q: Is there a child seat available?
A: No, We're sorry.

Q: Do you offer shared transfers?
A: No, we only provide private transfers to ensure comfort and efficiency.

## Pricing & Additional Costs ##
Q: Are there any hidden fees?
A: No, our pricing is transparent with no hidden charges.

Q: Do you charge extra for night-time transfers?
A: No, our prices remain the same 24/7.

# Contact Information # 
- Phone: (+66) 099 108 7999
- Mobile: (+66) 099 108 7999
- WhatsApp: (+66) 099 108 7999
- Email: info@samui-transfers.com
- Follow us on Facebook: https://www.facebook.com/profile.php?id=61578880422159
- Address: 9/38 Moo 6 Tambol Bophut, Amphoe Koh Samui, Thailand, 84320

## Why Choose Us ##
We are committed to providing the best transfer experience on Koh Samui. Our local expertise, dedication to customer service, and focus on safety set us apart. Whether you're traveling solo, with family, or in a group, we have the right vehicle and service to meet your needs. Enjoy the beauty of Koh Samui with peace of mind, knowing that your transfers are in capable hands. Thank you for choosing Samui Transfers—let's make your journey unforgettable!
- Ready We’re always prepared for your trip.
- Reliable We’re always on time, every time.
- Safe Your safety is our top priority.
- Friendly Our drivers are here to help you.
- Fair Pricing Pay only for the distance you travel.

 ## Our Vehicles ##
        - **Minibus**: Our minivans are spacious, air-conditioned vehicles ideal for families, small groups, or travelers with extra luggage. Enjoy a comfortable ride with plenty of room for up to 7 passengers and their bags—perfect for airport transfers, tours, or group trips around Koh Samui.
        - **SUV**: Travel in style and comfort with our SUVs. Suitable for up to 4 passengers, these vehicles offer a smooth ride, extra luggage space, and are perfect for couples, small families, or business travelers.

## Our Services ##
        - Airport Transfers: Hassle-free transfers to and from Samui International Airport.
        - Hotel Transfers: Convenient pickups and drop-offs at your hotel or resort.
        - Private Tours: Customized tours around Koh Samui’s top attractions.
        - Group Transfers: Spacious vehicles for larger groups or families.

        ## Why Choose Samui Transfers? ##
        - Local Expertise: Our team knows Koh Samui inside out, ensuring you get the best routes and recommendations.
        - 24/7 Availability: We’re here for you around the clock, ready to assist with your transfer needs at any time.
        - Comfortable Vehicles: Our fleet is equipped with modern, air-conditioned vehicles for a pleasant journey.
        - Competitive Rates: Enjoy transparent pricing with no hidden fees, ensuring you get the best value for your money.
        - Safe and Secure: All our drivers are professionally trained and adhere to strict safety standards.
        - Customer Satisfaction: We pride ourselves on delivering exceptional service, with a focus on your comfort and convenience.

        ## Book Your Transfer Today ##
        Ready to experience the best transfer service on Koh Samui? Booking is easy! Visit our website at [Samui-Transfers.com](https://www.samui-transfers.com) or contact us directly via phone, WhatsApp, or Line. Our friendly team is here to assist you with any questions and help you plan your perfect transfer. Whether you need a quick airport pickup or a full day of exploring the island, Samui Transfers is your go-to choice for reliable and friendly service.

        ## Booking Information ##
        To book your transfer, please provide the following details:
        - Name
        - Email
        - Phone Number
        - Pickup Location
        - Drop-off Location
        - Date and Time
        - Number of Passengers
        - Luggage Requirements
        - Flight Details, Flight Number, Arrival Time or Departure Time
        - Special Requests

        Once we have your information, we’ll confirm your booking and provide you with all the details you need for a smooth transfer experience.

        ## Payment Methods ##
        We accept a variety of payment methods to make your booking process as convenient as possible. You can pay via:
        - Cash (Thai Baht)
        - QR Code (PromptPay)
        - PayPal
        - Bank Transfer 

        ## Terms and Conditions ##
        - All bookings are subject to availability.
        - Cancellations must be made at least 24 hours in advance for a full refund.
        - Prices are subject to change without notice, but confirmed bookings will be honored at the agreed price.
        - We reserve the right to refuse service to anyone who poses a safety risk or violates our terms of service.

        ## Policy ##
        - **Cancellation Policy**: Free cancellation up to 24 hours before your transfer.
        - **Privacy Policy**: We respect your privacy and will not share your personal information with third parties without your consent.
        - **Terms of Service**: By using our services, you agree to our terms and conditions as outlined on our website.    

       
        `

   console.log("Context for AI:", context);

  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system", content: systemPrompt + "\n" + context },
      { role: "user", content: message },
    ],
  });
  const reply = completion.choices[0]?.message?.content || "";

  console.log("Hello API OPENAI")
  
  console.log("AI Response:", reply || "No response");

  res.status(200).json({ reply});
}