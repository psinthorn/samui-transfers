export const ManagedBy = {
    ManagedBy: {
        id: "1",
        nameEn: "F2 Co.,Ltd.",
        nameTh: "บริษัท เอฟทู จำกัด",
        address: "9/38 Moo 6 Bophut, Koh Samui, Surath Thani 84320 (Thailand) ",

    },
    Payment: [
        {
        id: "1",
        method: "bank transfer  (transfer to Siam Commercial Bank)",
        status: "pending",
        details: `
        <p><strong>Bank Name:</strong> Siam Commercial Bank</p>
        <p><strong>Account Type:</strong> Savings</p>
        <p><strong>Account Name:</strong> F2 Co.,Ltd. (บริษััท เอฟทู จำกัด)</p>
        <p><strong>Account Number:</strong> 423-060145-0</p>
        <p><strong>SWIFT Code:</strong> SICOTHBK</p>
        <p><strong>Bank Address:</strong> 9/38 Moo 6 Tambol Bophut, Amphoe Koh Samui, Thailand, 84320</p>
        <p><strong>Phone:</strong> (+66) 099 108 7999</p>
        <p><strong>Email:</strong> info@f2.co.th</p>`
    },
    {
        id: "2",
        method: "Paypal",
        status: "pending",
        details: `
        <p><strong>PayPal Email:</strong> f2coltd@gmail.com</p>
        <p><strong>Note:</strong> Please include your booking ID in the payment description.</p>
        <p><strong>Phone:</strong> (+66) 099 108 7999</p>
        <p><strong>Email:</strong> info@f2.co.th</p>`
    }
]
}